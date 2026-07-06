// src/context/usePilotContext.tsx

import React, {
    createContext,
    useContext,
    type ReactNode,
} from "react";

import { usePilot } from "../hooks/usePilot";

type PilotContextType = ReturnType<typeof usePilot>;

const PilotContext = createContext<PilotContextType | null>(null);

export function PilotProvider({
    children,
}: {
    children: ReactNode;
}) {
    const pilot = usePilot();

    return (
        <PilotContext.Provider value= { pilot } >
        { children }
        </PilotContext.Provider>
    );
}

export function usePilotContext() {
    const context = useContext(PilotContext);

    if (!context) {
        throw new Error(
            "usePilotContext must be used inside <PilotProvider>"
        );
    }

    return context;
}