import React, { Fragment, useState } from "react";
import { pick } from "ramda";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Window from "./Window";
import Popover from "./Popover";
import { WindowHelper } from "../utils/windowHelper";
import { clampToDayIntvl, isWholeDayIntvl } from "../utils/dates";
import { useStorePick } from "../store";
import { useModal } from "../context/modal";
import { useEvts } from "../context/events";
import { orFilterEvents, viewDateFilter } from "../models/event";
import { CalEvent } from "../types";

import "./Events.css";

export interface EventsProps {
    viewDate: Date;
    windowHelper: WindowHelper;
}

export default function Events({ viewDate, windowHelper }: EventsProps) {
    let { evts } = useEvts();
    evts = orFilterEvents(evts, viewDateFilter(viewDate));

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
                className="event-title"
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

interface EventPopoverProps {
    evt: CalEvent;
    setIsPopoverActive: (arg: boolean) => void;
}

function EventPopover({ evt, setIsPopoverActive }: EventPopoverProps) {
    const { deleteEvt } = useStorePick("deleteEvt");
    const { setIsModalOpen, setModalDataMode, setModalEditEvt } = useModal();

    return (
        <Popover>
            <Popover.Head>
                <div className="event-popover__buttons">
                    <span
                        className="event-popover__delete"
                        onClick={() => {
                            deleteEvt(evt.uuid);
                            setIsPopoverActive(false);
                        }}
                    >
                        <i className="fa-regular fa-trash-can"></i>
                    </span>
                    <span
                        className="event-popover__edit"
                        onClick={() => {
                            setModalDataMode("edit");
                            setModalEditEvt(evt);
                            setIsModalOpen(true);
                            setIsPopoverActive(false);
                        }}
                    >
                        <i className="fa-regular fa-pen-to-square"></i>
                    </span>
                </div>
                <div className="event-popover__title">{evt.title}</div>
            </Popover.Head>
            <Popover.Body>{evt.description}</Popover.Body>
        </Popover>
    );
}
