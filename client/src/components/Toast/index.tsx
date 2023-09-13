import React from "react";
import clsx from "clsx";

import { useStorePick } from "../../store";

import "./Styles.css";

export default function Toast() {
    const { toasts } = useStorePick("toasts");

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    className={clsx(
                        "toast",
                        `toast--${toast.status.toLowerCase()}`
                    )}
                >
                    <div className="toast-title">{toast.title}</div>
                    <div className="toast-description">{toast.description}</div>
                </div>
            ))}
        </div>
    );
}
