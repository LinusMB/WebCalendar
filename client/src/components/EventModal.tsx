import React, { Fragment, useEffect } from "react";
import { pick } from "ramda";

import { INTVL_MIN_RESIZE_STEP } from "../constants";
import { FromField, ToField } from "./IntervalFields";
import Modal from "./Modal";
import { useModal } from "../context/modal";
import { useInput } from "../hooks";
import {
    useStorePick,
    useEvtIntvlUpdateStart,
    useEvtIntvlUpdateEnd,
} from "../store";
import { useAddEvt, useEditEvt, useGetSurroundingEvts } from "../hooks/events";
import { invalidateOnEventChange } from "../react-query";
import { isWholeDayIntvl } from "../services/dates";
import { CalInterval, CalEvent } from "../types";

import "./EventModal.css";

export default function EventModal() {
    const {
        evtIntvl,
        setEvtIntvl,
        isEvtIntvlVisible,
        setIsEvtIntvlVisible,
        setEvtFilter,
        resetEvtFilter,
    } = useStorePick(
        "evtIntvl",
        "setEvtIntvl",
        "isEvtIntvlVisible",
        "setIsEvtIntvlVisible",
        "setEvtFilter",
        "resetEvtFilter"
    );
    const { mutateAsync: addEvt } = useAddEvt();
    const { mutateAsync: editEvt } = useEditEvt();

    const { setIsModalOpen, modalDataMode, modalEditEvt } = useModal();

    if (modalDataMode === "edit" && !modalEditEvt) {
        throw new Error(
            "modalEditEvt has to be set if modalDataMode is set to 'edit'"
        );
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

    async function onAddEvent() {
        await addEvt({ title, description, evtIntvl });
        invalidateOnEventChange(evtIntvl);
        resetTitle();
        resetDescription();
        setIsEvtIntvlVisible(false);
        setIsModalOpen(false);
    }

    async function onEditEvent() {
        await editEvt({
            uuid: modalEditEvt!.uuid,
            title,
            description,
            evtIntvl,
        });
        invalidateOnEventChange(evtIntvl);
        resetTitle();
        resetDescription();
        setIsEvtIntvlVisible(false);
        setIsModalOpen(false);
        resetEvtFilter();
    }

    function onClose() {
        resetTitle();
        resetDescription();
        if (modalDataMode === "edit") {
            setIsEvtIntvlVisible(false);
            resetEvtFilter();
        }
        setIsModalOpen(false);
    }

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

    const [title, onTitleChange, resetTitle] = useInput(initialTitle);
    const [description, onDescriptionChange, resetDescription] =
        useInput(initialDescription);

    return (
        <Modal>
            <Modal.Header>
                {headerText}
                <Modal.CloseButton onClick={onClose} />
            </Modal.Header>
            <Modal.Body className="event-modal__body">
                <input
                    type="text"
                    className="event-modal__title"
                    onChange={onTitleChange}
                    placeholder="Enter Title"
                    value={title}
                />
                {isEvtIntvlVisible && !isWholeDayIntvl(evtIntvl) ? (
                    <WithAdjustableIntvl evtIntvl={evtIntvl}>
                        {({ updateEvtIntvlStart, updateEvtIntvlEnd }) => (
                            <IntervalFields
                                evtIntvl={evtIntvl}
                                isEvtIntvlVisible={isEvtIntvlVisible}
                                updateEvtIntvlStart={updateEvtIntvlStart}
                                updateEvtIntvlEnd={updateEvtIntvlEnd}
                            />
                        )}
                    </WithAdjustableIntvl>
                ) : (
                    <IntervalFields
                        evtIntvl={evtIntvl}
                        isEvtIntvlVisible={isEvtIntvlVisible}
                    />
                )}
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

interface IntervalFieldsProps {
    evtIntvl: CalInterval;
    isEvtIntvlVisible: boolean;
    updateEvtIntvlStart?: (update: (newValue: Date) => Date) => void;
    updateEvtIntvlEnd?: (update: (newValue: Date) => Date) => void;
}

function IntervalFields({
    evtIntvl,
    isEvtIntvlVisible,
    updateEvtIntvlStart = () => {},
    updateEvtIntvlEnd = () => {},
}: IntervalFieldsProps) {
    return (
        <Fragment>
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
        </Fragment>
    );
}

interface WithAdjustableIntvlProps {
    evtIntvl: CalInterval;
    children: (props: {
        updateEvtIntvlStart: (update: (newValue: Date) => Date) => void;
        updateEvtIntvlEnd: (update: (newValue: Date) => Date) => void;
    }) => React.ReactNode;
}

function WithAdjustableIntvl({ evtIntvl, children }: WithAdjustableIntvlProps) {
    const { data } = useGetSurroundingEvts(evtIntvl);
    const [prevEvts = [], nextEvts = []] = data || [];

    const updateEvtIntvlStart = useEvtIntvlUpdateStart(
        INTVL_MIN_RESIZE_STEP,
        prevEvts
    );
    const updateEvtIntvlEnd = useEvtIntvlUpdateEnd(
        INTVL_MIN_RESIZE_STEP,
        nextEvts
    );

    return (
        <Fragment>
            {children({ updateEvtIntvlStart, updateEvtIntvlEnd })}
        </Fragment>
    );
}
