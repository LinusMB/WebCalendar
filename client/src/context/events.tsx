import React, { createContext, useContext } from "react";

import { CalEvent, View } from "../types";
import {
    useEvtsForDay,
    useEvtsForWeek,
    useEvtsForMonth,
} from "../hooks/events";

interface EventsContextType {
    evts: CalEvent[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}

const EventsContext = createContext<EventsContextType | null>(null);

export function useEvts() {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error("useEvts was used outside of EventsProvider");
    }
    return context;
}

export function EventsProvider({
    children,
    view,
    viewDate,
}: {
    children: React.ReactNode;
    view: View;
    viewDate: Date;
}) {
    let useEvts = {
        day: useEvtsForDay,
        week: useEvtsForWeek,
        month: useEvtsForMonth,
    }[view];

    const {
        data: evts = [],
        isLoading,
        isError,
        error,
    } = useEvts(viewDate);

    return (
        <EventsContext.Provider
            value={{
                evts,
                isLoading,
                isError,
                error,
            }}
        >
            {children}
        </EventsContext.Provider>
    );
}
