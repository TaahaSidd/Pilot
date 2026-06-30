import { useCallback, useEffect, useRef, useState } from "react";
import {
    pilotApi,
    ApiError,
    NetworkError,
    type PilotStatus,
    type StartResponse,
    type ConfirmLoginResponse,
    type ToggleBrowserResponse,
} from "../api/api";

const WS_URL = "ws://127.0.0.1:8000/logs";

const STATUS_POLL_INTERVAL_MS = 2000;
const WS_RECONNECT_BASE_MS = 1000;
const WS_RECONNECT_MAX_MS = 15000;

// ──────────────────────────────────────────────────────────────────
// usePilot owns LIVE, STATEFUL session data: polling, a persistent
// WebSocket connection, and derived state built from message
// history (awaitingLogin). api.ts owns single, stateless requests.
// This hook is a CONSUMER of api.ts, not a duplicate of it.
// ──────────────────────────────────────────────────────────────────

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

// One course's real, last-known state — derived from the "summary"
// broadcast event (show_course_summary in pilot_ui.py), which carries
// [{title, completion}, ...] for every run. This is the only place
// course data comes from; there is no separate "courses API."
export interface CourseSummary {
    title: string;
    completion: number;
}

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

    // derived from log history — real data, not fabricated stats.
    // courses is null until the first "summary" event of THIS session
    // has arrived (i.e. a workflow has run at least once since the
    // dashboard was opened) — components must handle that null case
    // rather than assuming data is always present.
    courses: CourseSummary[] | null;
    modulesCompletedThisRun: number;

    // best-effort "what's happening right now" text, parsed from the
    // most recent "course"/"module" log message. This is a string
    // scrape, not structured data — log_course/log_module_progress in
    // pilot_ui.py format these as human-readable text, not JSON
    // fields, so if that formatting ever changes, update the parsing
    // regex below to match. null until at least one such log has
    // arrived this session.
    currentCourseText: string | null;
    currentModuleText: string | null;

    // actions — each forwards to api.ts, hook just reacts to the result
    startWorkflow: () => Promise<StartResponse>;
    startNotes: () => Promise<StartResponse>;
    confirmLogin: () => Promise<ConfirmLoginResponse>;
    toggleBrowser: () => Promise<ToggleBrowserResponse>;
}

let _idCounter = 0;
function nextId(): string {
    _idCounter += 1;
    return `log_${_idCounter}_${Date.now()}`;
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
    const [courses, setCourses] = useState<CourseSummary[] | null>(null);
    const [modulesCompletedThisRun, setModulesCompletedThisRun] = useState(0);
    const [currentCourseText, setCurrentCourseText] = useState<string | null>(null);
    const [currentModuleText, setCurrentModuleText] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const unmountedRef = useRef(false);

    // ── Status polling ──────────────────────────────────────────

    const pollStatus = useCallback(async () => {
        try {
            const data = await pilotApi.getStatus();

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
            // a single missed poll isn't fatal (NetworkError or ApiError
            // both land here) — the next interval tries again. We don't
            // surface transient blips as statusError, since that field
            // is reserved for the server's own pilot.error.
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
    //
    // Note: the WebSocket connection itself is NOT routed through
    // api.ts — that module only handles request/response HTTP calls.
    // A persistent streaming connection is a genuinely different
    // concern and stays here.

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

            // "summary" carries the FULL real course list from
            // show_course_summary — replace, don't merge, since it's
            // always a complete snapshot, not a partial update.
            if (parsed.level === "summary" && Array.isArray(parsed.message)) {
                const valid = (parsed.message as unknown[]).filter(
                    (item): item is CourseSummary =>
                        typeof item === "object" &&
                        item !== null &&
                        "title" in item &&
                        "completion" in item
                );
                setCourses(valid);
            }

            // each "module" event represents one module being
            // processed during the CURRENT run — count them as a
            // simple "activity this session" signal. This resets to
            // 0 only on a fresh page load, not between runs, since
            // there's currently no per-run boundary marker to reset on.
            if (parsed.level === "module") {
                setModulesCompletedThisRun((prev) => prev + 1);

                // log_module_progress formats as:
                //   "{current}/{total} {mtype} — {title}"
                // e.g. "3/17 PAGE — E-Tutorial | Basics of AI"
                // Best-effort: just take the text after the em-dash as
                // the human-readable "current task" — if the format
                // ever changes in pilot_ui.py, update this to match.
                if (typeof parsed.message === "string") {
                    const dashSplit = parsed.message.split("—");
                    setCurrentModuleText(
                        dashSplit.length > 1 ? dashSplit[1].trim() : parsed.message
                    );
                }
            }

            // log_course formats as:
            //   "Course {current}/{total} — {title} ({completion}%)"
            // Same best-effort string parse as above.
            if (parsed.level === "course" && typeof parsed.message === "string") {
                const dashSplit = parsed.message.split("—");
                setCurrentCourseText(
                    dashSplit.length > 1 ? dashSplit[1].trim() : parsed.message
                );
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

    // ── Actions — each just forwards to api.ts, then reacts ──────

    const startWorkflow = useCallback(async () => {
        const result = await pilotApi.startWorkflow();
        if (result.started) {
            await pollStatus();
        }
        return result;
    }, [pollStatus]);

    const startNotes = useCallback(async () => {
        const result = await pilotApi.startNotes();
        if (result.started) {
            await pollStatus();
        }
        return result;
    }, [pollStatus]);

    const confirmLogin = useCallback(async () => {
        const result = await pilotApi.confirmLogin();
        if (result.confirmed) {
            setAwaitingLogin(false);
        }
        return result;
    }, []);

    const toggleBrowser = useCallback(async () => {
        return pilotApi.toggleBrowser();
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
        courses,
        modulesCompletedThisRun,
        currentCourseText,
        currentModuleText,
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
        message: parsed.message,
    };
}

// re-exported so screens that catch errors from usePilot's actions
// can check `err instanceof ApiError` / `NetworkError` without a
// separate import from api.ts
export { ApiError, NetworkError };
export type { PilotStatus };
