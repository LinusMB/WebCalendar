import React, { useEffect, useRef } from "react";

import { INTVL_RESIZE_MIN_MULT } from "../constants";
import {
    useStore,
    useEvtsForDay,
    useEvtIntvlIncStart,
    useEvtIntvlDecStart,
    useEvtIntvlIncEnd,
    useEvtIntvlDecEnd,
} from "../store";
import { startOfDay, differenceInMinutes, getDayIntvl } from "../utils/dates";
import { CalInterval, CellInfo } from "../types";

import "./EventInterval.css";

interface EventIntervalBarTopProps {
    minHeight: number;
    viewDate: Date;
}

function EventIntervalBarTop({
    minHeight,
    viewDate,
}: EventIntervalBarTopProps) {
    const {
        evtIntvlResize: { start: resize },
        setEvtIntvlResizeStart: setResize,
    } = useStore();

    const evts = useEvtsForDay(viewDate);
    const incStart = useEvtIntvlIncStart(
        INTVL_RESIZE_MIN_MULT,
        getDayIntvl(viewDate)
    );
    const decStart = useEvtIntvlDecStart(getDayIntvl(viewDate), evts);

    const ref = useRef({ startY: 0, remainder: 0 });

    function onMouseDownHandler(e: React.MouseEvent<HTMLDivElement>) {
        setResize(true);
        ref.current.startY = e.clientY;
        ref.current.remainder = 0;
    }

    function onMouseMoveHandler(e: MouseEvent) {
        let { startY, remainder } = ref.current;
        const mouseDiff = e.clientY - startY;
        const mins = mouseDiff / minHeight + remainder;
        remainder = mins % INTVL_RESIZE_MIN_MULT;
        const minsRounded = mins - remainder;
        if (minsRounded < 0) {
            decStart(Math.abs(minsRounded));
        } else if (minsRounded > 0) {
            incStart(minsRounded);
        }
        ref.current.startY = e.clientY;
        ref.current.remainder = remainder;
    }

    function onMouseUpHandler() {
        setResize(false);
    }

    useEffect(() => {
        if (resize) {
            window.addEventListener("mousemove", onMouseMoveHandler);
            window.addEventListener("mouseup", onMouseUpHandler, {
                once: true,
            });
        }
        return () =>
            window.removeEventListener("mousemove", onMouseMoveHandler);
    }, [resize]);

    return (
        <div
            className="event-interval__bar-top"
            onMouseDown={onMouseDownHandler}
        ></div>
    );
}

interface EventIntervalBarBottomProps {
    minHeight: number;
    viewDate: Date;
}

function EventIntervalBarBottom({
    minHeight,
    viewDate,
}: EventIntervalBarBottomProps) {
    const {
        evtIntvlResize: { end: resize },
        setEvtIntvlResizeEnd: setResize,
    } = useStore();

    const evts = useEvtsForDay(viewDate);
    const incEnd = useEvtIntvlIncEnd(getDayIntvl(viewDate), evts);
    const decEnd = useEvtIntvlDecEnd(
        INTVL_RESIZE_MIN_MULT,
        getDayIntvl(viewDate)
    );

    const ref = useRef({ startY: 0, remainder: 0 });

    function onMouseDownHandler(e: React.MouseEvent<HTMLDivElement>) {
        setResize(true);
        ref.current.startY = e.clientY;
        ref.current.remainder = 0;
    }

    function onMouseMoveHandler(e: MouseEvent) {
        let { startY, remainder } = ref.current;
        const mouseDiff = e.clientY - startY;
        const mins = mouseDiff / minHeight + remainder;
        remainder = mins % INTVL_RESIZE_MIN_MULT;
        const minsRounded = mins - remainder;
        if (minsRounded < 0) {
            decEnd(Math.abs(minsRounded));
        } else if (minsRounded > 0) {
            incEnd(minsRounded);
        }
        ref.current.startY = e.clientY;
        ref.current.remainder = remainder;
    }

    function onMouseUpHandler() {
        setResize(false);
    }

    useEffect(() => {
        if (resize) {
            window.addEventListener("mousemove", onMouseMoveHandler);
            window.addEventListener("mouseup", onMouseUpHandler, {
                once: true,
            });
        }
        return () =>
            window.removeEventListener("mousemove", onMouseMoveHandler);
    }, [resize]);

    return (
        <div
            className="event-interval__bar-bottom"
            onMouseDown={onMouseDownHandler}
        ></div>
    );
}

interface EventIntervalProps {
    viewDate: Date;
    intvl: CalInterval;
    cellInfo: CellInfo;
    resizable?: boolean;
    wholeDay?: boolean;
    children?: React.ReactNode;
}

export default function EventInterval({
    viewDate,
    intvl,
    cellInfo,
    resizable,
    wholeDay,
    children,
}: EventIntervalProps) {
    let style;
    let topResizable = resizable;
    let bottomResizable = resizable;

    if (wholeDay) {
        style = cellInfo;
        topResizable = false;
        bottomResizable = false;
    } else {
        let dupIntvl = { ...intvl };
        {
            const { start, end } = getDayIntvl(viewDate);
            if (dupIntvl.start < start) {
                dupIntvl.start = start;
                topResizable = false;
            }
            if (dupIntvl.end > end) {
                dupIntvl.end = end;
                bottomResizable = false;
            }
        }
        const minHeight = cellInfo.height / 60;
        const minStart = differenceInMinutes(
            dupIntvl.start,
            startOfDay(dupIntvl.start)
        );
        const minDist = differenceInMinutes(dupIntvl.end, dupIntvl.start);
        const ZeroHourStartPx = cellInfo.top + cellInfo.height;
        style = {
            top: ZeroHourStartPx + minStart * minHeight,
            height: minDist * minHeight,
            width: cellInfo.width,
            left: cellInfo.left,
        };
    }

    return (
        <td
            onClick={(e) => e.stopPropagation()}
            style={style}
            className="event-interval"
        >
            {topResizable && (
                <EventIntervalBarTop
                    minHeight={cellInfo.height / 60}
                    viewDate={viewDate}
                />
            )}
            {children}
            {bottomResizable && (
                <EventIntervalBarBottom
                    minHeight={cellInfo.height / 60}
                    viewDate={viewDate}
                />
            )}
        </td>
    );
}
