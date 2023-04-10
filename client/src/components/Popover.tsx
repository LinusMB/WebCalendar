import React, { useState, useRef, useLayoutEffect } from "react";

import "./Popover.css";

type Direction = "top" | "bottom";

export interface PopoverProps {
    children?: React.ReactNode;
}

const Popover = ({ children }: PopoverProps) => {
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
            {children}
        </div>
    );
};

export interface PopoverHeadProps {
    children?: React.ReactNode;
}

Popover.Head = ({ children }: PopoverHeadProps) => {
    return <div className="popover__header">{children}</div>;
};

export interface PopoverBodyProps {
    children?: React.ReactNode;
}

Popover.Body = ({ children }: PopoverBodyProps) => {
    return <div className="popover__body">{children}</div>;
};

export default Popover;
