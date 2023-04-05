import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "./Header.css";

export default function Header() {
    return (
        <header className="header">
            <nav className="nav">
                <span className="logo">
                    <i className="fa-solid fa-calendar"></i>
                </span>
                <i className="fa-solid fa-magnifying-glass"></i>
                <i className="fa-solid fa-gear"></i>
                <i className="fa-solid fa-user"></i>
            </nav>
        </header>
    );
}
