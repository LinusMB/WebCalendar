import React from "react";

import { INTVL_MIN_RESIZE_STEP } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import {
    useStorePick,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";
import { isWholeDayIntvl } from "../services/dates";
import { useGetPreviousEvts, useGetNextEvts } from "../hooks/events";

import "./NewEvent.css";

export default function NewEvent() {
    const { isEvtIntvlVisible } = useStorePick("isEvtIntvlVisible");

    if (isEvtIntvlVisible) {
        return <NewEventActive />;
    }
    return <NewEventInactive />;
}

function NewEventActive() {
    const { evtIntvl } = useStorePick("evtIntvl");

    const { data: prevEvts = [] } = useGetPreviousEvts(evtIntvl);
    const { data: nextEvts = [] } = useGetNextEvts(evtIntvl);

    const { setIsModalOpen, setModalDataMode } = useModal();
    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_MIN_RESIZE_STEP,
        prevEvts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(
        INTVL_MIN_RESIZE_STEP,
        nextEvts
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
                date={evtIntvl.start}
                updateDate={updateEvtIntvlStart}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
                isEvtIntvlActive={true}
            />
            <ToField
                className="new-event__to"
                date={evtIntvl.end}
                updateDate={updateEvtIntvlEnd}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
                isEvtIntvlActive={true}
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
            <FromField className="new-event__from" isEvtIntvlActive={false} />
            <ToField className="new-event__to" isEvtIntvlActive={false} />
        </div>
    );
}
