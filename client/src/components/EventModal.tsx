import React, { useEffect } from "react";
import { pick } from "ramda";

import { INTVL_MIN_RESIZE_STEP } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import Modal from "./Modal";
import { useModal } from "../context/modal";
import { useInput } from "../hooks";
import {
    useStorePick,
    useEvts,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";
import { isWholeDayIntvl } from "../utils/dates";
import "./EventModal.css";

export default function EventModal() {
    const {
        evtIntvl,
        setEvtIntvl,
        isEvtIntvlVisible,
        setIsEvtIntvlVisible,
        addEvt,
        editEvt,
        setEvtFilter,
        resetEvtFilter,
    } = useStorePick(
        "evtIntvl",
        "setEvtIntvl",
        "isEvtIntvlVisible",
        "setIsEvtIntvlVisible",
        "addEvt",
        "editEvt",
        "setEvtFilter",
        "resetEvtFilter"
    );

    const evts = useEvts();

    const { setIsModalOpen, modalDataMode, modalEditEvt } = useModal();

    if (modalDataMode === "edit" && !modalEditEvt) {
        throw new Error(
            "modalEditEvt has to be set if modalDataMode is set to 'edit'"
        );
    }

    function onAddEvent() {
        addEvt(title, description, evtIntvl);
        resetTitle();
        resetDescription();
        setIsEvtIntvlVisible(false);
        setIsModalOpen(false);
    }

    function onEditEvent() {
        editEvt(modalEditEvt!.uuid, title, description, evtIntvl);
        resetTitle();
        resetDescription();
        setIsEvtIntvlVisible(false);
        setIsModalOpen(false);
        resetEvtFilter();
    }

    useEffect(() => {
        if (modalDataMode === "edit") {
            setEvtFilter({
                uuid: (uuid: string) => uuid !== modalEditEvt!.uuid,
            });
            setEvtIntvl(pick(["start", "end"], modalEditEvt!));
            setIsEvtIntvlVisible(true);
        }
    }, []);

    let initialTitle: string,
        initialDescription: string,
        headerText: string,
        onClick: () => void;
    switch (modalDataMode) {
        case "edit":
            initialTitle = modalEditEvt!.title;
            initialDescription = modalEditEvt!.description;
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

    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_MIN_RESIZE_STEP,
        evts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(INTVL_MIN_RESIZE_STEP, evts);

    const [title, onTitleChange, resetTitle] = useInput(initialTitle);
    const [description, onDescriptionChange, resetDescription] =
        useInput(initialDescription);

    return (
        <Modal>
            <Modal.Header>
                {headerText}
                <Modal.CloseButton onClick={() => setIsModalOpen(false)} />
            </Modal.Header>
            <Modal.Body className="event-modal__body">
                <input
                    type="text"
                    className="event-modal__title"
                    onChange={onTitleChange}
                    placeholder="Enter Title"
                    value={title}
                />
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
                <textarea
                    className="event-modal__description"
                    onChange={onDescriptionChange}
                    placeholder="Enter Description"
                    value={description}
                />
            </Modal.Body>
            <Modal.Footer>
                <button onClick={onClick} disabled={!isEvtIntvlVisible}>
                    Save changes
                </button>
            </Modal.Footer>
        </Modal>
    );
}
