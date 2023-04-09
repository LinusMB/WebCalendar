import React, { Fragment, useState, useRef, useEffect } from "react";
import { range } from "ramda";

import EventInterval from "./EventInterval";
import Events from "./Events";
import CalendarHeader from "./CalendarHeader";
import { WindowHelper } from "../utils/windowHelper";
import { useStore } from "../store";
import {
    weekdayMap,
    wholeDayIntvl,
    dateToFmt,
    getDay,
    incDay,
    decDay,
    dateToHourIntvl,
    setHours,
} from "../utils/dates";

import "./DayView.css";

function DayViewHeader() {
    const { viewDate, updateViewDate } = useStore();

    const dateStr = `${weekdayMap[getDay(viewDate)]} ${dateToFmt(viewDate)}`;
    function onClickLeftChv() {
        updateViewDate(decDay);
    }
    function onClickRightChv() {
        updateViewDate(incDay);
    }

    return (
        <tr className="day-view__row">
            <td className="day-view__header" colSpan={2}>
                <CalendarHeader
                    dateStr={dateStr}
                    onClickLeftChv={onClickLeftChv}
                    onClickRightChv={onClickRightChv}
                />
            </td>
        </tr>
    );
}

function DayViewWholeDayRow() {
    const { viewDate, setEvtIntvl, evtIntvlActive, setEvtIntvlActive } =
        useStore();

    const [windowHelper, setWindowHelper] = useState<WindowHelper | null>(null);
    const $td = useRef<HTMLTableCellElement>(null);
    function updateWindowHelper() {
        if ($td.current) {
            const rect = $td.current.getBoundingClientRect();
            setWindowHelper(new WindowHelper(rect.height));
        }
    }
    useEffect(() => {
        updateWindowHelper();
        window.addEventListener("resize", updateWindowHelper);
        window.addEventListener("scroll", updateWindowHelper);
        return () => {
            window.removeEventListener("resize", updateWindowHelper);
            window.removeEventListener("scroll", updateWindowHelper);
        };
    }, []);

    return (
        <Fragment>
            <tr className="day-view__row">
                <td className="day-view__time">Whole Day</td>
                <td
                    onClick={function (e) {
                        if (!$td.current) return;
                        const { top, right, bottom, left } =
                            $td.current.getBoundingClientRect();
                        if (
                            e.clientX >= left &&
                            e.clientX <= right &&
                            e.clientY >= top &&
                            e.clientY <= bottom
                        ) {
                            setEvtIntvl(wholeDayIntvl(viewDate));
                            setEvtIntvlActive(true);
                        }
                    }}
                    className="day-view__events day-view__events--whole-day"
                    ref={$td}
                >
                    {windowHelper && (
                        <Fragment>
                            <Events
                                viewDate={viewDate}
                                windowHelper={windowHelper}
                            />
                            {evtIntvlActive && (
                                <EventInterval
                                    viewDate={viewDate}
                                    windowHelper={windowHelper}
                                />
                            )}
                        </Fragment>
                    )}
                </td>
            </tr>
        </Fragment>
    );
}

function DayViewHourRow({ hour }: { hour: number }) {
    const { viewDate, setEvtIntvl, setEvtIntvlActive } = useStore();

    return (
        <tr className="day-view__row">
            <td className="day-view__time">
                {hour.toString().padStart(2, "0")}
            </td>
            <td
                onClick={function () {
                    setEvtIntvl(dateToHourIntvl(setHours(viewDate, hour)));
                    setEvtIntvlActive(true);
                }}
                className="day-view__events"
            ></td>
        </tr>
    );
}

function DayViewGrid() {
    return (
        <Fragment>
            <DayViewWholeDayRow />
            {range(0, 24).map((h, i) => (
                <DayViewHourRow key={i} hour={h} />
            ))}
        </Fragment>
    );
}

export default function DayView() {
    return (
        <table className="day-view">
            <tbody>
                <DayViewHeader />
                <DayViewGrid />
            </tbody>
        </table>
    );
}
