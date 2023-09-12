import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar";
import Main from "../layout/Main";
import EventModal from "../EventModal";
import { ModalProvider, useModal } from "../../context/modal";
import { queryClient } from "../../react-query";

import "./Styles.css";

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ModalProvider>
                <BrowserRouter>{children}</BrowserRouter>
            </ModalProvider>
        </QueryClientProvider>
    );
}

function App() {
    const { isModalOpen } = useModal();
    return (
        <div className="app">
            {isModalOpen && <EventModal />}
            <Header />
            <Sidebar />
            <Main />
        </div>
    );
}

export default () => (
    <Wrapper>
        <App />
    </Wrapper>
);
