import React from "react";
import { BrowserRouter } from "react-router-dom";

import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import Main from "./layout/Main";
import { ModalProvider } from "../context/modal";

import "./App.css";

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <ModalProvider>
            <BrowserRouter>{children}</BrowserRouter>
        </ModalProvider>
    );
}

function App() {
    return (
        <div className="app">
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
