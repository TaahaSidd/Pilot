/**
 * api.ts — single shared client for talking to Pilot's local FastAPI
 * backend (server.py).
 *
 * Unlike a typical multi-user web app's API client, this one is
 * deliberately simple:
 *   - no auth tokens / refresh logic — the backend is a local,
 *     single-user process with no login session to expire
 *   - no public/private endpoint distinction — every route is
 *     equally reachable, since it's one trusted local process
 *   - one job: stop every screen from hardcoding the base URL and
 *     hand-rolling its own fetch + error handling
 *
 * If Pilot ever runs as anything other than "one local server, one
 * local GUI" (e.g. a hosted multi-user version), THAT is the point
 * to revisit auth — not before.
 */

export const API_BASE = "http://127.0.0.1:8000";

// ──────────────────────────────────────────────────────────────────
// Error type — lets callers distinguish "request reached the server
// but the server rejected it" (ApiError) from "request never reached
// the server at all" (network failure, backend not running).
// ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
    status: number;
    detail: unknown;

    constructor(status: number, message: string, detail?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
    }
}

export class NetworkError extends Error {
    constructor(message = "Couldn't reach Pilot's backend. Is it running?") {
        super(message);
        this.name = "NetworkError";
    }
}

// ──────────────────────────────────────────────────────────────────
// Core request helper
// ──────────────────────────────────────────────────────────────────

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    let res: Response;

    try {
        res = await fetch(`${API_BASE}${path}`, {
            headers: options.body
                ? { "Content-Type": "application/json", ...options.headers }
                : options.headers,
            ...options,
        });
    } catch {
        // fetch itself threw — the server is unreachable, not just
        // unhappy with the request
        throw new NetworkError();
    }

    if (!res.ok) {
        let detail: unknown;
        try {
            detail = await res.json();
        } catch {
            detail = undefined;
        }

        const message =
            (detail as { detail?: string })?.detail ??
            `Request failed: ${res.status} ${res.statusText}`;

        throw new ApiError(res.status, message, detail);
    }

    // some routes (e.g. confirm-login) may return empty bodies
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}

export const apiGet = <T>(path: string): Promise<T> =>
    request<T>(path, { method: "GET" });

export const apiPost = <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

export const apiPatch = <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, {
        method: "PATCH",
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

// ──────────────────────────────────────────────────────────────────
// Typed endpoint functions — mirrors server.py route-for-route.
// Keep this list in sync with server.py; if you add a route there,
// add its typed wrapper here rather than calling apiGet/apiPost
// directly from components.
// ──────────────────────────────────────────────────────────────────

export type PilotStatus = "idle" | "running" | "done" | "error";

export interface StatusResponse {
    status: PilotStatus;
    error: string | null;
    configured: boolean;
}

export interface ConfigResponse {
    configured: boolean;
    username?: string;
    display_name?: string;
    phone_number?: string;
}

export interface OnboardingPayload {
    groq_api_key: string;
    username: string;
    password: string;
    phone_number: string;
    display_name: string;
}

export interface ConfigUpdatePayload {
    groq_api_key?: string;
    username?: string;
    password?: string;
    phone_number?: string;
    display_name?: string;
}

export interface StartResponse {
    started: boolean;
    reason?: string;
}

export interface ConfirmLoginResponse {
    confirmed: boolean;
    reason?: string;
}

export interface ToggleBrowserResponse {
    toggled: boolean;
    reason?: string;
}

export const pilotApi = {
    getStatus: () => apiGet<StatusResponse>("/status"),

    getConfig: () => apiGet<ConfigResponse>("/config"),

    setConfig: (payload: OnboardingPayload) =>
        apiPost<{ saved: boolean }>("/config", payload),

    updateConfig: (payload: ConfigUpdatePayload) =>
        apiPatch<{ saved: boolean; updated_fields: string[] }>("/config", payload),

    startWorkflow: () => apiPost<StartResponse>("/workflow/start"),

    startNotes: () => apiPost<StartResponse>("/notes/start"),

    confirmLogin: () =>
        apiPost<ConfirmLoginResponse>("/workflow/confirm-login"),

    toggleBrowser: () =>
        apiPost<ToggleBrowserResponse>("/browser/toggle"),
};