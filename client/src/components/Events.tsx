import React, { Fragment, useState } from "react";
import { pick } from "ramda";

import Window from "./Window";
import Popover from "./Popover";
import { WindowHelper } from "../utils/windowHelper";
import { clampToDayIntvl } from "../utils/dates";
import { useEvtsForDay } from "../store";
import { CalEvent } from "../types";

import "./Events.css";

export interface EventsProps {
    viewDate: Date;
    windowHelper: WindowHelper | null;
}

export default function Events({ viewDate, windowHelper }: EventsProps) {
    if (!windowHelper) return null;

    const evts = useEvtsForDay(viewDate);
    return (
        <Fragment>
            {evts.map((e) => (
                <Event
                    evt={e}
                    viewDate={viewDate}
                    windowHelper={windowHelper}
                />
            ))}
        </Fragment>
    );
}

interface EventProps {
    evt: CalEvent;
    viewDate: Date;
    windowHelper: WindowHelper;
}

function Event({ evt, viewDate, windowHelper }: EventProps) {
    const [isPopoverActive, setIsPopoverActive] = useState(false);

    return (
        <Window
            dimensions={windowHelper.getDimensions(
                clampToDayIntvl(pick(["start", "end"], evt), viewDate)
            )}
        >
            <span
                className="event-title"
                onClick={() => setIsPopoverActive((isActive) => !isActive)}
            >
                {evt.title}
                {isPopoverActive && <Popover />}
            </span>
        </Window>
    );
}
