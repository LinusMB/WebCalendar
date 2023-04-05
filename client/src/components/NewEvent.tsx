import React from "react";
import { modify } from "ramda";

import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import { useStore } from "../store";
import { isWholeDayIntvl } from "../utils/dates";

import "./NewEvent.css";

export default function NewEvent() {
    const { evtIntvl, updateEvtIntvl } = useStore();
    const { setModalActive } = useModal();

    function updateEvtIntvlStart(update: (arg: Date) => Date) {
        updateEvtIntvl((intvl) => modify("start", update, intvl));
    }

    function updateEvtIntvlEnd(update: (arg: Date) => Date) {
        updateEvtIntvl((intvl) => modify("end", update, intvl));
    }

    return (
        <div className="new-event">
            <button
                onClick={() => setModalActive(true)}
                className="new-event__btn"
            >
                New Event
            </button>
            <FromField
                className="new-event__from"
                date={evtIntvl.start}
                updateDate={updateEvtIntvlStart}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
            />
            <ToField
                className="new-event__to"
                date={evtIntvl.end}
                updateDate={updateEvtIntvlEnd}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
            />
        </div>
    );
}
