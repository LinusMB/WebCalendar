import React, { Fragment, useState } from "react";
import { pick, where } from "ramda";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Window from "./Window";
import EventPopover from "./EventPopover";
import { useEvts } from "../context/events";
import { useStorePick } from "../store";
import { WindowHelper } from "../services/windowHelper";
import { clampToDayIntvl, isWholeDayIntvl } from "../services/dates";
import { filterEvents, viewDateFilter } from "../services/events";
import { CalEvent } from "../types";

import "./Events.css";

export interface EventsProps {
    viewDate: Date;
    windowHelper: WindowHelper;
}

export default function Events({ viewDate, windowHelper }: EventsProps) {
    let { evts } = useEvts();
    const { evtFilter } = useStorePick("evtFilter");

    evts = filterEvents(evts, viewDateFilter(viewDate), where(evtFilter));

    return (
        <Fragment>
            {evts.map((e) => (
                <Event
                    key={e.uuid}
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

    const intvl = pick(["start", "end"], evt);
    const dimensions = isWholeDayIntvl(intvl)
        ? windowHelper.getDimensionsWholeDay()
        : windowHelper.getDimensions(clampToDayIntvl(intvl, viewDate));

    return (
        <Window dimensions={dimensions}>
            <span
                className="event-title relative"
                onClick={() => setIsPopoverActive((isActive) => !isActive)}
            >
                {evt.title}
                {isPopoverActive && (
                    <EventPopover
                        evt={evt}
                        setIsPopoverActive={setIsPopoverActive}
                    />
                )}
            </span>
        </Window>
    );
}
