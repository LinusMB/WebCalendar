import React from "react";

import { INTVL_MIN_RESIZE_STEP } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import {
    useStorePick,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";
import { isWholeDayIntvl } from "../utils/dates";

import "./NewEvent.css";

export default function NewEvent() {
    const { evts, evtIntvl, isEvtIntvlVisible } = useStorePick("evts", "evtIntvl", "isEvtIntvlVisible");
    const { setIsModalOpen, setModalDataMode } = useModal();
    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_MIN_RESIZE_STEP,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_MIN_RESIZE_STEP, evts);

    return (
        <div className="new-event">
            <button
                onClick={() => {
                    setModalDataMode("add");
                    setIsModalOpen(true);
                }}
                className="new-event__btn"
                disabled={!isEvtIntvlVisible}
            >
                New Event
            </button>
            <FromField
                className="new-event__from"
                date={evtIntvl.start}
                updateDate={updateEvtIntvlStart}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
                isEvtIntvlActive={isEvtIntvlVisible}
            />
            <ToField
                className="new-event__to"
                date={evtIntvl.end}
                updateDate={updateEvtIntvlEnd}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
                isEvtIntvlActive={isEvtIntvlVisible}
            />
        </div>
    );
}
