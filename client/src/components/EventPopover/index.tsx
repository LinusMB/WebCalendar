import React from "react";
import { pick } from "ramda";

import Popover from "../shared/Popover";
import { useDeleteEvent } from "../../hooks/events";
import { invalidateOnEventChange } from "../../react-query/invalidate";
import { useStorePick } from "../../store";

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
    const { openModal } = useStorePick("openModal");
    const deleteMutation = useDeleteEvent();

    function onDeleteEvent(e: React.MouseEvent) {
        deleteMutation.mutate(
            { uuid: event.uuid },
            {
                onSettled: () => {
                    setIsPopoverActive(false);
                },
                onSuccess: () => {
                    invalidateOnEventChange(pick(["start", "end"], event));
                },
            }
        );
        e.stopPropagation();  // otherwise event would bubble up to parent which unmounts component and interrupts mutation callbacks
    }

    function onClickEdit() {
        openModal({ type: "Edit", event });
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
