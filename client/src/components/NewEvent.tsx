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
    const { evts, evtIntvl, isEvtIntvlVisible } = useStore();
    const { isModalOpen, setIsModalOpen } = useModal();
    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_RESIZE_MIN_MULT,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_RESIZE_MIN_MULT, evts);

    return (
        <div className="new-event">
            {isModalOpen && <NewEventModal />}
            <button
                onClick={() => setIsModalOpen(true)}
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

function NewEventModal() {
    const { evts, evtIntvl, isEvtIntvlVisible, setIsEvtIntvlVisible, addEvt } =
        useStore();

    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_RESIZE_MIN_MULT,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_RESIZE_MIN_MULT, evts);

    const { setIsModalOpen } = useModal();
    const [title, onTitleChange, resetTitle] = useInput("");
    const [description, onDescriptionChange, resetDescription] = useInput("");

    function onClick() {
        addEvt(title, description);
        resetTitle();
        resetDescription();
        setIsEvtIntvlVisible(false);
        setIsModalOpen(false);
    }

    return (
        <Modal>
            <Modal.Header>
                Event
                <Modal.CloseButton onClick={() => setIsModalOpen(false)} />
            </Modal.Header>
            <Modal.Body>
                <input type="text" onChange={onTitleChange} value={title} />
                <FromField
                    date={evtIntvl.start}
                    updateDate={updateEvtIntvlStart}
                    isWholeDay={isWholeDayIntvl(evtIntvl)}
                    isEvtIntvlActive={isEvtIntvlVisible}
                />
                <ToField
                    date={evtIntvl.end}
                    updateDate={updateEvtIntvlEnd}
                    isWholeDay={isWholeDayIntvl(evtIntvl)}
                    isEvtIntvlActive={isEvtIntvlVisible}
                />
                <textarea onChange={onDescriptionChange} value={description} />
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onClick} disabled={!isEvtIntvlVisible}>
                    Save changes
                </button>
            </Modal.Footer>
        </Modal>
    );
}
