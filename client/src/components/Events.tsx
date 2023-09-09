import React, { Fragment, useState } from "react";
import { pick, where } from "ramda";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Window from "./Window";
import EventPopover from "./EventPopover";
import { useEvents } from "../context/events";
import { useStorePick } from "../store";
import { WindowHelper } from "../services/windowHelper";
import { clampToDayInterval, isWholeDayInterval } from "../services/dates";
import { filterEvents, viewDateFilter } from "../services/events";
import { CalEvent } from "../types";

import "./Events.css";

export interface EventsProps {
    viewDate: Date;
    windowHelper: WindowHelper;
}

export default function Events({ viewDate, windowHelper }: EventsProps) {
    let { events } = useEvents();
    const { eventFilter } = useStorePick("eventFilter");

    events = filterEvents(events, viewDateFilter(viewDate), where(eventFilter));

    return (
        <Fragment>
            {events.map((e) => (
                <Event
                    key={e.uuid}
                    event={e}
                    viewDate={viewDate}
                    windowHelper={windowHelper}
                />
            ))}
        </Fragment>
    );
}

interface EventProps {
    event: CalEvent;
    viewDate: Date;
    windowHelper: WindowHelper;
}

function Event({ event, viewDate, windowHelper }: EventProps) {
    const [isPopoverActive, setIsPopoverActive] = useState(false);

    const interval = pick(["start", "end"], event);
    const dimensions = isWholeDayInterval(interval)
        ? windowHelper.getDimensionsWholeDay()
        : windowHelper.getDimensions(clampToDayInterval(interval, viewDate));

    return (
        <Window dimensions={dimensions}>
            <span
                className="event-title relative"
                onClick={() => setIsPopoverActive((isActive) => !isActive)}
            >
                {event.title}
                {isPopoverActive && (
                    <EventPopover
                        event={event}
                        setIsPopoverActive={setIsPopoverActive}
                    />
                )}
            </span>
        </Window>
    );
}
