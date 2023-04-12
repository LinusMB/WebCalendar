import React, { createContext, useState, useContext } from "react";

interface ModalContextType {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
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

    return (
        <ModalContext.Provider
            value={{
                isModalOpen: isModalOpen,
                setIsModalOpen: setIsModalOpen,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
}
