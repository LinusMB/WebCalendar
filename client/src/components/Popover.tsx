import React, { useState, useRef, useLayoutEffect } from "react";

import "./Popover.css";

type Direction = "top" | "bottom";

export default function Popover() {
    const [direction, setDirection] = useState<Direction>("bottom");
    const $div = useRef<HTMLDivElement>(null);
    function updateDirection() {
        if ($div.current) {
            const rect = $div.current.getBoundingClientRect();
            if (rect.bottom > window.innerHeight) {
                setDirection("top");
            } else if (rect.top < 0) {
                setDirection("bottom");
            }
        }
    }
    useLayoutEffect(() => {
        updateDirection();
        window.addEventListener("resize", updateDirection);
        window.addEventListener("scroll", updateDirection);
        return () => {
            window.removeEventListener("resize", updateDirection);
            window.removeEventListener("scroll", updateDirection);
        };
    }, []);

    return (
        <div className={`popover popover--${direction}`} ref={$div}>
            <div className="popover__header">Popover Header</div>
            <div className="popover__body">Popover Body</div>
        </div>
    );
}
