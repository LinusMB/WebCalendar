import React from "react";
import { modify } from "ramda";

import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import { useStore } from "../store";
import { isWholeDayIntvl } from "../utils/dates";

import "./DateSelection.css";

export default function DateSelection() {
    const { evtIntvl, updateEvtIntvl } = useStore();
    const { setModalActive } = useModal();

    function updateEvtIntvlStart(update: (arg: Date) => Date) {
        updateEvtIntvl((intvl) => modify("start", update, intvl));
    }

    function updateEvtIntvlEnd(update: (arg: Date) => Date) {
        updateEvtIntvl((intvl) => modify("end", update, intvl));
    }

    return (
        <div className="date-selection">
            <button
                onClick={() => setModalActive(true)}
                className="date-selection__btn-new-event"
            >
                New Event
            </button>
            <FromField
                className="date-selection__from"
                date={evtIntvl.start}
                updateDate={updateEvtIntvlStart}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
            />
            <ToField
                className="date-selection__to"
                date={evtIntvl.end}
                updateDate={updateEvtIntvlEnd}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
            />
        </div>
    );
}
