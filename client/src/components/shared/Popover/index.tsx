import React, { useState, useRef, useLayoutEffect } from "react";

import "./Styles.css";

type Direction = "top" | "bottom";

export interface PopoverProps extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
}

const Popover = ({ children, ...props }: PopoverProps) => {
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
        <div className={`popover popover--${direction}`} ref={$div} {...props}>
            {children}
        </div>
    );
};

export interface PopoverHeadProps
    extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
}

Popover.Head = ({ children, ...props }: PopoverHeadProps) => {
    return (
        <div className="popover__header" {...props}>
            {children}
        </div>
    );
};

export interface PopoverBodyProps
    extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
}

Popover.Body = ({ children, ...props }: PopoverBodyProps) => {
    return (
        <div className="popover__body" {...props}>
            {children}
        </div>
    );
};

export default Popover;
