import React from "react";

import { INTVL_RESIZE_MIN_MULT } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import {
    useStore,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";
import { isWholeDayIntvl } from "../utils/dates";

import "./NewEvent.css";

export default function NewEvent() {
    const { evts, evtIntvl, evtIntvlActive } = useStore();
    const { setModalActive } = useModal();
    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_RESIZE_MIN_MULT,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_RESIZE_MIN_MULT, evts);

    return (
        <div className="new-event">
            <button
                onClick={() => setModalActive(true)}
                className="new-event__btn"
                disabled={!evtIntvlActive}
            >
                New Event
            </button>
            <FromField
                className="new-event__from"
                date={evtIntvl.start}
                updateDate={updateEvtIntvlStart}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
                isEvtIntvlActive={evtIntvlActive}
            />
            <ToField
                className="new-event__to"
                date={evtIntvl.end}
                updateDate={updateEvtIntvlEnd}
                isWholeDay={isWholeDayIntvl(evtIntvl)}
                isEvtIntvlActive={evtIntvlActive}
            />
        </div>
    );
}
