import React from "react";
import { BrowserRouter } from "react-router-dom";

import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import Main from "./layout/Main";
import Modal from "./Modal";
import { ModalProvider, useModal } from "../context/modal";

import "./App.css";

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <ModalProvider>
            <BrowserRouter>{children}</BrowserRouter>
        </ModalProvider>
    );
}

function App() {
    const { modalActive } = useModal();
    return (
        <div className="app">
            {modalActive && <Modal />}
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
