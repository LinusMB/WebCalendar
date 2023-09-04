import React, { useState } from "react";

import { useEvts } from "../context/events";
import { filterEvents, viewDateFilter } from "../services/events";
import { CalEvent } from "../types";
import EventPopover from "./EventPopover";

import "./EventDots.css";

export interface EventDots {
    viewDate: Date;
}

export default function EventDots({ viewDate }: EventDots) {
    let { evts } = useEvts();
    evts = filterEvents(evts, viewDateFilter(viewDate));

    return (
        <div className="event-dots">
            {evts.map((e) => (
                <EventDot key={e.uuid} evt={e} />
            ))}
        </div>
    );
}

interface EventDotProps {
    evt: CalEvent;
}

function EventDot({ evt }: EventDotProps) {
    const [isPopoverActive, setIsPopoverActive] = useState(false);

    return (
        <span
            className="event-dot"
            onClick={() => setIsPopoverActive((isActive) => !isActive)}
        >
            {isPopoverActive && (
                <EventPopover
                    evt={evt}
                    setIsPopoverActive={setIsPopoverActive}
                />
            )}
        </span>
    );
}
