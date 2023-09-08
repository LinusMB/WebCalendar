import React from "react";
import { pick } from "ramda";

import Popover from "./Popover";
import { useModal } from "../context/modal";
import { useDeleteEvt } from "../hooks/events";
import { invalidateOnEventChange } from "../react-query/invalidate";
import { CalEvent } from "../types";

import "./EventPopover.css";

export interface EventPopoverProps {
    evt: CalEvent;
    setIsPopoverActive: (arg: boolean) => void;
}

export default function EventPopover({
    evt,
    setIsPopoverActive,
}: EventPopoverProps) {
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
