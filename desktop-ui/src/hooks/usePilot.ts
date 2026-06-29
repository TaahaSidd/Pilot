import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/logs";

const STATUS_POLL_INTERVAL_MS = 2000;
const WS_RECONNECT_BASE_MS = 1000;
const WS_RECONNECT_MAX_MS = 15000;

// ──────────────────────────────────────────────────────────────────
// Types — mirror server.py's actual response/event shapes exactly.
// If you add fields server-side, add them here too; don't let this
// drift from server.py's Pydantic models.
// ──────────────────────────────────────────────────────────────────

export type PilotStatus = "idle" | "running" | "done" | "error";

export interface StatusResponse {
    status: PilotStatus;
    error: string | null;
    configured: boolean;
}

export type LogLevel =
    | "info"
    | "success"
    | "warning"
    | "error"
    | "skip"
    | "page"
    | "quiz"
    | "course"
    | "module"
    | "summary"
    | "action_required";

export interface LogEvent {
    level: LogLevel;
    message: string | Record<string, unknown> | unknown[];
    // client-assigned, not server-assigned — lets React key log lists
    // without relying on array index (which breaks on reconnect splices)
    _id: string;
}

export type WsConnectionState = "connecting" | "open" | "closed";

interface UsePilotResult {
    // status polling
    status: PilotStatus;
    statusError: string | null;
    configured: boolean;
    statusLoading: boolean;

    // logs
    logs: LogEvent[];
    clearLogs: () => void;
    wsState: WsConnectionState;

    // the one piece of derived UI state this hook owns deliberately
    awaitingLogin: boolean;

    // actions
    startWorkflow: () => Promise<{ started: boolean; reason?: string }>;
    startNotes: () => Promise<{ started: boolean; reason?: string }>;
    confirmLogin: () => Promise<{ confirmed: boolean; reason?: string }>;
    toggleBrowser: () => Promise<{ toggled: boolean; reason?: string }>;
}

let _idCounter = 0;
function nextId(): string {
    _idCounter += 1;
    return `log_${_idCounter}_${Date.now()}`;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        throw new Error(`${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

/**
 * usePilot — single hook for the whole Pilot dashboard surface:
 * status polling, workflow/notes control, CAPTCHA hand-off, and a
 * resilient (auto-reconnecting) log stream.
 *
 * Deliberately NOT split into smaller hooks: status, logs, and
 * awaitingLogin all need to agree with each other (e.g. status
 * flipping to "done" should also clear awaitingLogin if a run
 * finishes oddly), so they live together to avoid cross-hook sync bugs.
 */
export function usePilot(): UsePilotResult {
    const [status, setStatus] = useState<PilotStatus>("idle");
    const [statusError, setStatusError] = useState<string | null>(null);
    const [configured, setConfigured] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);

    const [logs, setLogs] = useState<LogEvent[]>([]);
    const [wsState, setWsState] = useState<WsConnectionState>("connecting");
    const [awaitingLogin, setAwaitingLogin] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const unmountedRef = useRef(false);

    // ── Status polling ──────────────────────────────────────────

    const pollStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/status`);
            if (!res.ok) throw new Error(`status ${res.status}`);
            const data: StatusResponse = await res.json();

            setStatus(data.status);
            setStatusError(data.error);
            setConfigured(data.configured);

            // if the run is no longer active, we can't still be waiting on
            // a login confirmation — clear it defensively so the UI never
            // gets stuck showing a CAPTCHA button after a run ends
            if (data.status !== "running") {
                setAwaitingLogin(false);
            }
        } catch {
            // a single missed poll isn't fatal — the next interval tries
            // again. We don't surface transient network blips as statusError,
            // since that field is reserved for the server's own pilot.error.
        } finally {
            setStatusLoading(false);
        }
    }, []);

    useEffect(() => {
        pollStatus();
        const interval = setInterval(pollStatus, STATUS_POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [pollStatus]);

    // ── WebSocket log stream, with backoff reconnect ────────────
    //
    // socketIdRef guards against StrictMode's dev-only double-invoke of
    // effects (mount -> cleanup -> mount again). WebSocket.close() is
    // ASYNC — it doesn't sever the connection instantly — so if a second
    // effect run calls connectWs() before the first socket has actually
    // finished closing, you can briefly have two live sockets both
    // receiving the same broadcast (visible as every log line doubling).
    // Each socket gets a token; only the socket matching the CURRENT
    // token is allowed to touch state. A superseded socket's handlers
    // become no-ops the moment a newer one is created.

    const socketIdRef = useRef(0);

    const connectWs = useCallback(() => {
        if (unmountedRef.current) return;

        const socketId = ++socketIdRef.current;
        setWsState("connecting");
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            if (socketIdRef.current !== socketId) return; // superseded — ignore
            reconnectAttemptRef.current = 0;
            setWsState("open");
        };

        ws.onmessage = (event) => {
            if (socketIdRef.current !== socketId) return; // superseded — ignore

            let parsed: { level: LogLevel; message: LogEvent["message"] };
            try {
                parsed = JSON.parse(event.data);
            } catch {
                return; // malformed payload — drop it rather than crash the UI
            }

            const entry: LogEvent = { ..._stripId(parsed), _id: nextId() };
            setLogs((prev) => [...prev, entry]);

            if (parsed.level === "action_required") {
                setAwaitingLogin(true);
            }
        };

        ws.onclose = () => {
            if (socketIdRef.current !== socketId) return; // superseded — ignore

            setWsState("closed");
            wsRef.current = null;
            if (unmountedRef.current) return;

            const attempt = reconnectAttemptRef.current + 1;
            reconnectAttemptRef.current = attempt;
            const delay = Math.min(
                WS_RECONNECT_BASE_MS * 2 ** (attempt - 1),
                WS_RECONNECT_MAX_MS
            );
            reconnectTimerRef.current = setTimeout(connectWs, delay);
        };

        ws.onerror = () => {
            // onclose always fires after onerror for browser WebSockets,
            // so reconnect scheduling is handled there, not here
        };
    }, []);

    useEffect(() => {
        unmountedRef.current = false;
        connectWs();
        return () => {
            unmountedRef.current = true;
            socketIdRef.current++; // invalidate this effect run's socket immediately
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            wsRef.current?.close();
        };
    }, [connectWs]);

    const clearLogs = useCallback(() => setLogs([]), []);

    // ── Actions ──────────────────────────────────────────────────

    const startWorkflow = useCallback(async () => {
        const result = await postJson<{ started: boolean; reason?: string }>(
            "/workflow/start"
        );
        if (result.started) {
            await pollStatus();
        }
        return result;
    }, [pollStatus]);

    const startNotes = useCallback(async () => {
        const result = await postJson<{ started: boolean; reason?: string }>(
            "/notes/start"
        );
        if (result.started) {
            await pollStatus();
        }
        return result;
    }, [pollStatus]);

    const confirmLogin = useCallback(async () => {
        const result = await postJson<{ confirmed: boolean; reason?: string }>(
            "/workflow/confirm-login"
        );
        if (result.confirmed) {
            setAwaitingLogin(false);
        }
        return result;
    }, []);

    const toggleBrowser = useCallback(async () => {
        return postJson<{ toggled: boolean; reason?: string }>("/browser/toggle");
    }, []);

    return {
        status,
        statusError,
        configured,
        statusLoading,
        logs,
        clearLogs,
        wsState,
        awaitingLogin,
        startWorkflow,
        startNotes,
        confirmLogin,
        toggleBrowser,
    };
}

function _stripId(parsed: {
    level: LogLevel;
    message: LogEvent["message"];
}): Omit<LogEvent, "_id"> {
    return {
        level: parsed.level,
        message: parsed.message
    };
}