import React, { Fragment, useState } from "react";
import { pick } from "ramda";

import Window from "./Window";
import Popover from "./Popover";
import { WindowHelper } from "../utils/windowHelper";
import { clampToDayIntvl, isWholeDayIntvl } from "../utils/dates";
import { useEvtsForDay, useStorePick } from "../store";
import { useModal } from "../context/modal";
import { CalEvent } from "../types";

import "./Events.css";

export interface EventsProps {
    viewDate: Date;
    windowHelper: WindowHelper;
}

export default function Events({ viewDate, windowHelper }: EventsProps) {
    const evts = useEvtsForDay(viewDate);
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
    const { deleteEvt } = useStorePick("deleteEvt");

    const { setIsModalOpen, setModalDataMode, setModalEditEvt } = useModal();

    const [isPopoverActive, setIsPopoverActive] = useState(false);

    const intvl = pick(["start", "end"], evt);
    const dimensions = isWholeDayIntvl(intvl)
        ? windowHelper.getDimensionsWholeDay()
        : windowHelper.getDimensions(clampToDayIntvl(intvl, viewDate));

    return (
        <Window dimensions={dimensions}>
            <span
                className="event-title"
                onClick={() => setIsPopoverActive((isActive) => !isActive)}
            >
                {evt.title}
                {isPopoverActive && (
                    <Popover>
                        <Popover.Head>
                            {evt.title}
                            <button
                                onClick={() => {
                                    deleteEvt(evt.uuid);
                                    setIsPopoverActive(false);
                                }}
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    setModalDataMode("edit");
                                    setModalEditEvt(evt);
                                    setIsModalOpen(true);
                                    setIsPopoverActive(false);
                                }}
                            >
                                Edit
                            </button>
                        </Popover.Head>
                        <Popover.Body>{evt.description}</Popover.Body>
                    </Popover>
                )}
            </span>
        </Window>
    );
}
