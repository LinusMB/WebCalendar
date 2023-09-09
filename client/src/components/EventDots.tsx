import React, { useState } from "react";

import { useEvents } from "../context/events";
import { filterEvents, viewDateFilter } from "../services/events";
import { CalEvent } from "../types";
import EventPopover from "./EventPopover";

import "./EventDots.css";

export interface EventDots {
    viewDate: Date;
}

export default function EventDots({ viewDate }: EventDots) {
    let { events } = useEvents();
    events = filterEvents(events, viewDateFilter(viewDate));

    return (
        <div className="event-dots">
            {events.map((e) => (
                <EventDot key={e.uuid} event={e} />
            ))}
        </div>
    );
}

interface EventDotProps {
    event: CalEvent;
}

function EventDot({ event }: EventDotProps) {
    const [isPopoverActive, setIsPopoverActive] = useState(false);

    return (
        <span
            className="event-dot"
            onClick={() => setIsPopoverActive((isActive) => !isActive)}
        >
            {isPopoverActive && (
                <EventPopover
                    event={event}
                    setIsPopoverActive={setIsPopoverActive}
                />
            )}
        </span>
    );
}
