import React, { useEffect, useRef } from "react";

import "./Window.css";

export interface Dimensions {
    top: number;
    height: number;
    width: number;
    left: number;
}

export interface WindowProps {
    dimensions: Dimensions;
    onDragTopBar?: (pixelDiff: number) => void;
    onDragBottomBar?: (pixelDiff: number) => void;
    isTopResizable?: boolean;
    isBottomResizable?: boolean;
    useIsResizeTopActive?: () => [boolean, (resize: boolean) => void];
    useIsResizeBottomActive?: () => [boolean, (resize: boolean) => void];
    children?: React.ReactNode;
}

export default function Window({
    dimensions,
    onDragTopBar,
    onDragBottomBar,
    isTopResizable,
    isBottomResizable,
    useIsResizeTopActive,
    useIsResizeBottomActive,
    children,
}: WindowProps) {
    return (
        <td style={dimensions} className="window">
            {isTopResizable && onDragTopBar && useIsResizeTopActive && (
                <Bar
                    className="window__bar-top"
                    useIsResizeActive={useIsResizeTopActive}
                    onDrag={onDragTopBar}
                />
            )}
            {children}
            {isBottomResizable &&
                onDragBottomBar &&
                useIsResizeBottomActive && (
                    <Bar
                        className="window__bar-bottom"
                        useIsResizeActive={useIsResizeBottomActive}
                        onDrag={onDragBottomBar}
                    />
                )}
        </td>
    );
}

function Bar({
    className,
    onDrag,
    useIsResizeActive,
}: {
    className: string;
    onDrag: (pixeDiff: number) => void;
    useIsResizeActive: () => [boolean, (resize: boolean) => void];
}) {
    const [isResizeActive, setIsResizeActive] = useIsResizeActive();

    const $startY = useRef(0);

    function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        $startY.current = e.clientY;
        setIsResizeActive(true);
    }

    function onMouseMove(e: MouseEvent) {
        const pixelDiff = e.clientY - $startY.current;
        onDrag(pixelDiff);
        $startY.current = e.clientY;
    }

    function onMouseUp() {
        setIsResizeActive(false);
    }

    useEffect(() => {
        if (isResizeActive) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp, { once: true });
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
        };
    }, [isResizeActive]);

    return <div onMouseDown={onMouseDown} className={className}></div>;
}
