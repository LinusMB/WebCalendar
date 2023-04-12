import React, { createContext, useState, useContext } from "react";

import { CalEvent } from "../types";

type ModalDataMode = "add" | "edit";

interface ModalContextType {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    modalDataMode: ModalDataMode;
    setModalDataMode: React.Dispatch<React.SetStateAction<ModalDataMode>>;
    modalEditEvt: CalEvent | null;
    setModalEditEvt: React.Dispatch<React.SetStateAction<CalEvent | null>>;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal was used outside of ModalProvider");
    }
    return context;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDataMode, setModalDataMode] = useState<ModalDataMode>("add");
    const [modalEditEvt, setModalEditEvt] = useState<CalEvent | null>(null);

    return (
        <ModalContext.Provider
            value={{
                isModalOpen,
                setIsModalOpen,
                modalDataMode,
                setModalDataMode,
                modalEditEvt,
                setModalEditEvt,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}
