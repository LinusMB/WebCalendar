import React, { createContext, useState, useContext } from "react";

interface ModalContextType {
    modalActive: boolean;
    setModalActive: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [modalActive, setModalActive] = useState(false);

    return (
        <ModalContext.Provider
            value={{
                modalActive,
                setModalActive,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}
