import React, { Fragment, useEffect } from "react";
import { pick } from "ramda";

import { INTERVAL_MIN_RESIZE_STEP } from "../../constants";
import { FromField, ToField } from "../IntervalFields";
import Modal from "../shared/Modal";
import { useModal } from "../../context/modal";
import { useInput } from "../../hooks";
import {
    useStorePick,
    useEventIntervalUpdateStart,
    useEventIntervalUpdateEnd,
} from "../../store";
import {
    useAddEvent,
    useEditEvent,
    useGetPreviousEvents,
    useGetNextEvents,
} from "../../hooks/events";
import { invalidateOnEventChange } from "../../react-query/invalidate";
import { CalInterval } from "../../types";

import "./Styles.css";

export default function EventModal() {
    const {
        eventInterval,
        setEventInterval,
        isEventIntervalActive: isEventIntervalActive,
        setIsEventIntervalActive,
        setEventFilter,
        resetEventFilter,
    } = useStorePick(
        "eventInterval",
        "setEventInterval",
        "isEventIntervalActive",
        "setIsEventIntervalActive",
        "setEventFilter",
        "resetEventFilter"
    );
    const { mutateAsync: addEvent } = useAddEvent();
    const { mutateAsync: editEvent } = useEditEvent();

    const { setIsModalOpen, modalDataMode, modalEditEvent } = useModal();

    if (modalDataMode === "edit" && !modalEditEvent) {
        throw new Error(
            "modalEditEvent has to be set if modalDataMode is set to 'edit'"
        );
    }

    useEffect(() => {
        if (modalDataMode === "edit") {
            setEventFilter({
                uuid: (uuid: string) => uuid !== modalEditEvent!.uuid,
            });
            setEventInterval(pick(["start", "end"], modalEditEvent!));
            setIsEventIntervalActive(true);
        }
    }, []);

    async function onAddEvent() {
        await addEvent({ title, description, eventInterval });
        invalidateOnEventChange(eventInterval);
        resetTitle();
        resetDescription();
        setIsEventIntervalActive(false);
        setIsModalOpen(false);
    }

    async function onEditEvent() {
        await editEvent({
            uuid: modalEditEvent!.uuid,
            title,
            description,
            eventInterval,
        });
        invalidateOnEventChange(eventInterval);
        resetTitle();
        resetDescription();
        setIsEventIntervalActive(false);
        setIsModalOpen(false);
        resetEventFilter();
    }

    function onClose() {
        resetTitle();
        resetDescription();
        if (modalDataMode === "edit") {
            setIsEventIntervalActive(false);
            resetEventFilter();
        }
        setIsModalOpen(false);
    }

    let initialTitle: string,
        initialDescription: string,
        headerText: string,
        onClick: () => void;
    switch (modalDataMode) {
        case "edit":
            initialTitle = modalEditEvent!.title;
            initialDescription = modalEditEvent!.description;
            headerText = "Edit Event";
            onClick = onEditEvent;
            break;
        case "add":
            initialTitle = "";
            initialDescription = "";
            headerText = "Add Event";
            onClick = onAddEvent;
            break;
    }

    const [title, onTitleChange, resetTitle] = useInput(initialTitle);
    const [description, onDescriptionChange, resetDescription] =
        useInput(initialDescription);

    return (
        <Modal>
            <Modal.Header>
                {headerText}
                <Modal.CloseButton onClick={onClose} />
            </Modal.Header>
            <Modal.Body className="event-modal__body">
                <input
                    type="text"
                    className="event-modal__title"
                    onChange={onTitleChange}
                    placeholder="Enter Title"
                    value={title}
                />
                {isEventIntervalActive ? (
                    <IntervalFieldsActive eventInterval={eventInterval} />
                ) : (
                    <IntervalFields
                        eventInterval={eventInterval}
                        isEventIntervalActive={false}
                    />
                )}
                <textarea
                    className="event-modal__description"
                    onChange={onDescriptionChange}
                    placeholder="Enter Description"
                    value={description}
                />
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onClick} disabled={!isEventIntervalActive}>
                    Save changes
                </button>
            </Modal.Footer>
        </Modal>
    );
}

interface IntervalFieldsProps {
    eventInterval: CalInterval;
    isEventIntervalActive: boolean;
    updateEventIntervalStart?: (update: (newValue: Date) => Date) => void;
    updateEventIntervalEnd?: (update: (newValue: Date) => Date) => void;
}

function IntervalFields({
    eventInterval,
    isEventIntervalActive,
    updateEventIntervalStart = () => {},
    updateEventIntervalEnd = () => {},
}: IntervalFieldsProps) {
    return (
        <Fragment>
            <FromField
                date={eventInterval.start}
                updateDate={updateEventIntervalStart}
                isEventIntervalActive={isEventIntervalActive}
            />
            <ToField
                date={eventInterval.end}
                updateDate={updateEventIntervalEnd}
                isEventIntervalActive={isEventIntervalActive}
            />
        </Fragment>
    );
}

function IntervalFieldsActive({
    eventInterval,
}: {
    eventInterval: CalInterval;
}) {
    const { data: prevEvents = [] } = useGetPreviousEvents(eventInterval);
    const { data: nextEvents = [] } = useGetNextEvents(eventInterval);

    const updateEventIntervalStart = useEventIntervalUpdateStart()(
        INTERVAL_MIN_RESIZE_STEP,
        prevEvents
    );
    const updateEventIntervalEnd = useEventIntervalUpdateEnd()(
        INTERVAL_MIN_RESIZE_STEP,
        nextEvents
    );
    return (
        <IntervalFields
            eventInterval={eventInterval}
            isEventIntervalActive={true}
            updateEventIntervalStart={updateEventIntervalStart}
            updateEventIntervalEnd={updateEventIntervalEnd}
        />
    );
}
