import React from "react";
import clsx from "clsx";

import { useStorePick } from "../../store";

import "./Styles.css";

export default function Toast() {
    const { toasts, removeToast } = useStorePick("toasts", "removeToast");

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    className={clsx(
                        "toast",
                        `toast--${toast.status.toLowerCase()}`
                    )}
                    onClick={() => removeToast(toast.id)}
                >
                    <div className="toast-title">{toast.title}</div>
                    <div className="toast-description">{toast.description}</div>
                </div>
            ))}
        </div>
    );
}
