import React from "react";

import { INTERVAL_MIN_RESIZE_STEP } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import {
    useStorePick,
    useEventIntervalUpdateStart,
    useEventIntervalUpdateEnd,
} from "../store";
import { isWholeDayInterval } from "../services/dates";
import { useGetPreviousEvents, useGetNextEvents } from "../hooks/events";

import "./NewEvent.css";

export default function NewEvent() {
    const { isEventIntervalVisible } = useStorePick("isEventIntervalVisible");

    if (isEventIntervalVisible) {
        return <NewEventActive />;
    }
    return <NewEventInactive />;
}

function NewEventActive() {
    const { eventInterval } = useStorePick("eventInterval");

    const { data: prevEvents = [] } = useGetPreviousEvents(eventInterval);
    const { data: nextEvents = [] } = useGetNextEvents(eventInterval);

    const { setIsModalOpen, setModalDataMode } = useModal();
    const updateEventIntervalStart = useEventIntervalUpdateStart(
        INTERVAL_MIN_RESIZE_STEP,
        prevEvents
    );
    const updateEventIntervalEnd = useEventIntervalUpdateEnd(
        INTERVAL_MIN_RESIZE_STEP,
        nextEvents
    );

    return (
        <div className="new-event">
            <button
                onClick={() => {
                    setModalDataMode("add");
                    setIsModalOpen(true);
                }}
                className="new-event__btn"
            >
                New Event
            </button>
            <FromField
                className="new-event__from"
                date={eventInterval.start}
                updateDate={updateEventIntervalStart}
                isWholeDay={isWholeDayInterval(eventInterval)}
                isEventIntervalActive={true}
            />
            <ToField
                className="new-event__to"
                date={eventInterval.end}
                updateDate={updateEventIntervalEnd}
                isWholeDay={isWholeDayInterval(eventInterval)}
                isEventIntervalActive={true}
            />
        </div>
    );
}

function NewEventInactive() {
    return (
        <div className="new-event">
            <button className="new-event__btn" disabled={true}>
                New Event
            </button>
            <FromField
                className="new-event__from"
                isEventIntervalActive={false}
            />
            <ToField className="new-event__to" isEventIntervalActive={false} />
        </div>
    );
}
