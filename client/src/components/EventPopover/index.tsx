import React from "react";
import { pick } from "ramda";

import Popover from "../shared/Popover";
import { useModal } from "../../context/modal";
import { useDeleteEvent } from "../../hooks/events";
import { invalidateOnEventChange } from "../../react-query/invalidate";
import { CalEvent } from "../../types";

import "./Styles.css";

export interface EventPopoverProps {
    event: CalEvent;
    setIsPopoverActive: (arg: boolean) => void;
}

export default function EventPopover({
    event,
    setIsPopoverActive,
}: EventPopoverProps) {
    const { mutateAsync: deleteEvent } = useDeleteEvent();
    const { setIsModalOpen, setModalDataMode, setModalEditEvent } = useModal();

    async function onDeleteEvent() {
        await deleteEvent({ uuid: event.uuid });
        invalidateOnEventChange(pick(["start", "end"], event));
        setIsPopoverActive(false);
    }

    function onClickEdit() {
        setModalDataMode("edit");
        setModalEditEvent(event);
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
                <div className="event-popover__title">{event.title}</div>
            </Popover.Head>
            <Popover.Body>{event.description}</Popover.Body>
        </Popover>
    );
}
