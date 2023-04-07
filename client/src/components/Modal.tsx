import React from "react";

import { INTVL_RESIZE_MIN_MULT } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import { useModal } from "../context/modal";
import { useInput } from "../hooks";
import { isWholeDayIntvl } from "../utils/dates";
import {
    useStore,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";

import "./Modal.css";

export default function Modal() {
    const { setModalActive } = useModal();
    const [title, onTitleChange, resetTitle] = useInput("");
    const [description, onDescriptionChange, resetDescription] = useInput("");

    const { evts, evtIntvl, addEvt, setEvtIntvlActive } = useStore();

    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_RESIZE_MIN_MULT,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_RESIZE_MIN_MULT, evts);

    function onClickHandler() {
        addEvt(title, description);
        resetTitle();
        resetDescription();
        setEvtIntvlActive(false);
        setModalActive(false);
    }

    return (
        <div className="modal">
            <div className="modal__content">
                <div className="modal__header">
                    Event
                    <span
                        onClick={() => setModalActive(false)}
                        className="modal__close"
                    >
                        &times;
                    </span>
                </div>
                <div className="modal__body">
                    <input type="text" onChange={onTitleChange} value={title} />
                    <FromField
                        date={evtIntvl.start}
                        updateDate={updateEvtIntvlStart}
                        isWholeDay={isWholeDayIntvl(evtIntvl)}
                    />
                    <ToField
                        date={evtIntvl.end}
                        updateDate={updateEvtIntvlEnd}
                        isWholeDay={isWholeDayIntvl(evtIntvl)}
                    />
                    <textarea
                        onChange={onDescriptionChange}
                        className="modal__textbox"
                        value={description}
                    />
                </div>
                <div className="modal__footer">
                    <button onClick={onClickHandler}>Save changes</button>
                </div>
            </div>
        </div>
    );
}
