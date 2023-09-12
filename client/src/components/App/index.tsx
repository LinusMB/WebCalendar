import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import Header from "../layout/Header";
import Sidebar from "../layout/Sidebar";
import Main from "../layout/Main";
import EventModal from "../EventModal";
import { queryClient } from "../../react-query";
import { useStorePick } from "../../store";

import "./Styles.css";

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
    );
}

function App() {
    const { isModalOpen } = useStorePick("isModalOpen");
    return (
        <div className="app">
            {/* <Toast /> */}
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
