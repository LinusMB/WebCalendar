import React from "react";

import { INTVL_RESIZE_MIN_MULT } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import Modal from "./Modal";
import { useModal } from "../context/modal";
import { useInput } from "../hooks";
import {
    useStore,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";
import { isWholeDayIntvl } from "../utils/dates";

import "./NewEvent.css";

export default function NewEvent() {
    const { evts, evtIntvl, evtIntvlActive } = useStore();
    const { modalActive, setModalActive } = useModal();
    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_RESIZE_MIN_MULT,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_RESIZE_MIN_MULT, evts);

    return (
        <div className="new-event">
            {modalActive && <NewEventModal />}
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

function NewEventModal() {
    const { evts, evtIntvl, evtIntvlActive, setEvtIntvlActive, addEvt } =
        useStore();

    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_RESIZE_MIN_MULT,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_RESIZE_MIN_MULT, evts);

    const { setModalActive } = useModal();
    const [title, onTitleChange, resetTitle] = useInput("");
    const [description, onDescriptionChange, resetDescription] = useInput("");

    function onClick() {
        addEvt(title, description);
        resetTitle();
        resetDescription();
        setEvtIntvlActive(false);
        setModalActive(false);
    }

    return (
        <Modal>
            <Modal.Header>
                Event
                <Modal.CloseButton onClick={() => setModalActive(false)} />
            </Modal.Header>
            <Modal.Body>
                <input type="text" onChange={onTitleChange} value={title} />
                <FromField
                    date={evtIntvl.start}
                    updateDate={updateEvtIntvlStart}
                    isWholeDay={isWholeDayIntvl(evtIntvl)}
                    isEvtIntvlActive={evtIntvlActive}
                />
                <ToField
                    date={evtIntvl.end}
                    updateDate={updateEvtIntvlEnd}
                    isWholeDay={isWholeDayIntvl(evtIntvl)}
                    isEvtIntvlActive={evtIntvlActive}
                />
                <textarea onChange={onDescriptionChange} value={description} />
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onClick} disabled={!evtIntvlActive}>
                    Save changes
                </button>
            </Modal.Footer>
        </Modal>
    );
}
