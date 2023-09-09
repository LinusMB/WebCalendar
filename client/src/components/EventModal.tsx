import React, { Fragment, useEffect } from "react";
import { pick } from "ramda";

import { INTERVAL_MIN_RESIZE_STEP } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import Modal from "./Modal";
import { useModal } from "../context/modal";
import { useInput } from "../hooks";
import {
    useStorePick,
    useEventIntervalUpdateStart,
    useEventIntervalUpdateEnd,
} from "../store";
import {
    useAddEvent,
    useEditEvent,
    useGetPreviousEvents,
    useGetNextEvents,
} from "../hooks/events";
import { invalidateOnEventChange } from "../react-query/invalidate";
import { isWholeDayInterval } from "../services/dates";
import { CalInterval } from "../types";

import "./EventModal.css";

export default function EventModal() {
    const {
        eventInterval,
        setEventInterval,
        isEventIntervalVisible,
        setIsEventIntervalVisible,
        setEventFilter,
        resetEventFilter,
    } = useStorePick(
        "eventInterval",
        "setEventInterval",
        "isEventIntervalVisible",
        "setIsEventIntervalVisible",
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
            setIsEventIntervalVisible(true);
        }
    }, []);

    async function onAddEvent() {
        await addEvent({ title, description, eventInterval });
        invalidateOnEventChange(eventInterval);
        resetTitle();
        resetDescription();
        setIsEventIntervalVisible(false);
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
        setIsEventIntervalVisible(false);
        setIsModalOpen(false);
        resetEventFilter();
    }

    function onClose() {
        resetTitle();
        resetDescription();
        if (modalDataMode === "edit") {
            setIsEventIntervalVisible(false);
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
                {isEventIntervalVisible && !isWholeDayInterval(eventInterval) ? (
                    <WithAdjustableInterval eventInterval={eventInterval}>
                        {({
                            updateEventIntervalStart,
                            updateEventIntervalEnd,
                        }) => (
                            <IntervalFields
                                eventInterval={eventInterval}
                                isEventIntervalVisible={isEventIntervalVisible}
                                updateEventIntervalStart={
                                    updateEventIntervalStart
                                }
                                updateEventIntervalEnd={updateEventIntervalEnd}
                            />
                        )}
                    </WithAdjustableInterval>
                ) : (
                    <IntervalFields
                        eventInterval={eventInterval}
                        isEventIntervalVisible={isEventIntervalVisible}
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
                <button onClick={onClick} disabled={!isEventIntervalVisible}>
                    Save changes
                </button>
            </Modal.Footer>
        </Modal>
    );
}

interface IntervalFieldsProps {
    eventInterval: CalInterval;
    isEventIntervalVisible: boolean;
    updateEventIntervalStart?: (update: (newValue: Date) => Date) => void;
    updateEventIntervalEnd?: (update: (newValue: Date) => Date) => void;
}

function IntervalFields({
    eventInterval,
    isEventIntervalVisible,
    updateEventIntervalStart = () => {},
    updateEventIntervalEnd = () => {},
}: IntervalFieldsProps) {
    return (
        <Fragment>
            <FromField
                date={eventInterval.start}
                updateDate={updateEventIntervalStart}
                isWholeDay={isWholeDayInterval(eventInterval)}
                isEventIntervalActive={isEventIntervalVisible}
            />
            <ToField
                date={eventInterval.end}
                updateDate={updateEventIntervalEnd}
                isWholeDay={isWholeDayInterval(eventInterval)}
                isEventIntervalActive={isEventIntervalVisible}
            />
        </Fragment>
    );
}

interface WithAdjustableIntervalProps {
    eventInterval: CalInterval;
    children: (props: {
        updateEventIntervalStart: (update: (newValue: Date) => Date) => void;
        updateEventIntervalEnd: (update: (newValue: Date) => Date) => void;
    }) => React.ReactNode;
}

function WithAdjustableInterval({
    eventInterval,
    children,
}: WithAdjustableIntervalProps) {
    const { data: prevEvents = [] } = useGetPreviousEvents(eventInterval);
    const { data: nextEvents = [] } = useGetNextEvents(eventInterval);

    const updateEventIntervalStart = useEventIntervalUpdateStart(
        INTERVAL_MIN_RESIZE_STEP,
        prevEvents
    );
    const updateEventIntervalEnd = useEventIntervalUpdateEnd(
        INTERVAL_MIN_RESIZE_STEP,
        nextEvents
    );

    return (
        <Fragment>
            {children({ updateEventIntervalStart, updateEventIntervalEnd })}
        </Fragment>
    );
}
