import React, { Fragment, useState } from "react";
import { pick, where } from "ramda";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Window from "./Window";
import Popover from "./Popover";
import { WindowHelper } from "../utils/windowHelper";
import { clampToDayIntvl, isWholeDayIntvl } from "../utils/dates";
import { useModal } from "../context/modal";
import { useEvts } from "../context/events";
import { useStorePick } from "../store";
import { useDeleteEvt } from "../hooks/events";
import { filterEvents, viewDateFilter } from "../models/event";
import { invalidateOnEventChange } from "../react-query";
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
    const { mutateAsync: deleteEvt } = useDeleteEvt();
    const { setIsModalOpen, setModalDataMode, setModalEditEvt } = useModal();

    async function onDeleteEvent() {
        await deleteEvt({ uuid: evt.uuid });
        invalidateOnEventChange(pick(["start", "end"], evt));
        setIsPopoverActive(false);
    }

    function onClickEdit() {
        setModalDataMode("edit");
        setModalEditEvt(evt);
        setIsModalOpen(true);
        setIsPopoverActive(false);
    }

    return (
        <Popover>
            <Popover.Head>
                <div className="event-popover__buttons">
                    <span
                        className="event-popover__delete"
                        onClick={onDeleteEvent}
                    >
                        <i className="fa-regular fa-trash-can"></i>
                    </span>
                    <span className="event-popover__edit" onClick={onClickEdit}>
                        <i className="fa-regular fa-pen-to-square"></i>
                    </span>
                </div>
                <div className="event-popover__title">{evt.title}</div>
            </Popover.Head>
            <Popover.Body>{evt.description}</Popover.Body>
        </Popover>
    );
}
