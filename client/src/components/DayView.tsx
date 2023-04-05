import React, { Fragment, useState, useRef, useEffect } from "react";
import { range } from "ramda";

import ViewEventInterval from "./ViewEventInterval";
import ViewEvents from "./ViewEvents";
import ViewHeader from "./ViewHeader";
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
import { CellInfo } from "../types";

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
                <ViewHeader
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

    const [cellInfo, setCellInfo] = useState<CellInfo | null>(null);
    const ref = useRef<HTMLTableCellElement>(null);
    function updateCellInfo() {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setCellInfo({
                height: rect.height,
                width: rect.width,
                left: rect.left,
                top: rect.top,
            });
        }
    }
    useEffect(() => {
        updateCellInfo();
        window.addEventListener("resize", updateCellInfo);
        window.addEventListener("scroll", updateCellInfo);
        return () => {
            window.removeEventListener("resize", updateCellInfo);
            window.removeEventListener("scroll", updateCellInfo);
        };
    }, []);

    return (
        <Fragment>
            <tr className="day-view__row">
                <td className="day-view__time">Whole Day</td>
                <td
                    onClick={function () {
                        setEvtIntvl(wholeDayIntvl(viewDate));
                        setEvtIntvlActive(true);
                    }}
                    className="day-view__events"
                    ref={ref}
                ></td>
            </tr>
            <ViewEvents viewDate={viewDate} cellInfo={cellInfo} />
            {evtIntvlActive && (
                <ViewEventInterval viewDate={viewDate} cellInfo={cellInfo} />
            )}
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
