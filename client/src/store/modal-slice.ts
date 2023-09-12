import { StateCreator } from "zustand";

import { CalEvent } from "../types";

type ModalOption =
    | { type: "None" }
    | { type: "Edit"; event: CalEvent }
    | { type: "Add" };

export interface ModalSlice {
    isModalOpen: boolean;
    modalOption: ModalOption;
    openModal: (option: ModalOption) => void;
    closeModal: () => void;
}

export const createModalSlice: StateCreator<ModalSlice> = (set) => ({
    isModalOpen: false,
    modalOption: { type: "None" },
    openModal(option) {
        set({ isModalOpen: true, modalOption: option });
    },
    closeModal() {
        set({ isModalOpen: false, modalOption: { type: "None" } });
    },
});
