import React, { Fragment, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { range } from "ramda";

import EventInterval from "./EventInterval";
import Events from "./Events";
import ViewHeader from "./ViewHeader";
import { useStore } from "../store";
import {
    getDay,
    getWeek,
    getYear,
    setHours,
    weekdayMap,
    dateToFmt,
    eachDayInWeek,
    wholeDayIntvl,
    incWeek,
    decWeek,
    dateToHourIntvl,
} from "../utils/dates";
import { CellInfo } from "../types";

import "./WeekView.css";

function WeekViewHeader() {
    const { viewDate, updateViewDate } = useStore();

    const dateStr = `Week ${getWeek(viewDate)}, ${getYear(viewDate)}`;
    function onClickLeftChv() {
        updateViewDate(decWeek);
    }
    function onClickRightChv() {
        updateViewDate(incWeek);
    }

    return (
        <tr className="week-view__row">
            <td className="week-view__header" colSpan={8}>
                <ViewHeader
                    dateStr={dateStr}
                    onClickLeftChv={onClickLeftChv}
                    onClickRightChv={onClickRightChv}
                />
            </td>
        </tr>
    );
}

function WeekViewDayCell({ date }: { date: Date }) {
    const navigate = useNavigate();
    const { setViewDate } = useStore();

    function onClickHandler() {
        setViewDate(date);
        navigate(`/day/${dateToFmt(date)}`);
    }

    const dateStr = `${weekdayMap[getDay(date)]} ${dateToFmt(date)}`;

    return (
        <td onClick={onClickHandler} className="week-view__day-col">
            {dateStr}
        </td>
    );
}

function WeekViewDayRow({ eachDay }: { eachDay: Date[] }) {
    return (
        <tr className="week-view__row">
            <td className="week-view__day-col"></td>
            {eachDay.map((d, i) => (
                <WeekViewDayCell key={i} date={d} />
            ))}
        </tr>
    );
}

function WeekViewWholeDayRow({ eachDay }: { eachDay: Date[] }) {
    const { setEvtIntvl, evtIntvlActive, setEvtIntvlActive } = useStore();

    const [cellInfo, setCellInfo] = useState<CellInfo[]>([]);
    const ref = useRef<HTMLTableCellElement[]>([]);
    function updateCellInfo() {
        const rects = ref.current.map((e) => e.getBoundingClientRect());
        setCellInfo(
            rects.map((r) => ({
                height: r.height,
                width: r.width,
                left: r.left,
                top: r.top,
            }))
        );
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
            <tr className="week-view__row">
                <td className="week-view__time">Whole Day</td>
                {eachDay.map((d, i) => (
                    <td
                        key={i}
                        onClick={function () {
                            setEvtIntvl(wholeDayIntvl(d));
                            setEvtIntvlActive(true);
                        }}
                        className="week-view__events"
                        ref={(el) => {
                            if (el) ref.current[i] = el;
                        }}
                    ></td>
                ))}
            </tr>
            {eachDay.map((d, i) => (
                <Fragment>
                    <Events viewDate={d} cellInfo={cellInfo[i]} />
                    {evtIntvlActive && (
                        <EventInterval viewDate={d} cellInfo={cellInfo[i]} />
                    )}
                </Fragment>
            ))}
        </Fragment>
    );
}

function WeekViewHourRow({ hour, eachDay }: { hour: number; eachDay: Date[] }) {
    const { setEvtIntvl, setEvtIntvlActive } = useStore();

    return (
        <tr className="week-view__row">
            <td className="week-view__time">
                {hour.toString().padStart(2, "0")}
            </td>
            {eachDay.map((d, i) => (
                <td
                    key={i}
                    onClick={function () {
                        setEvtIntvl(dateToHourIntvl(setHours(d, hour)));
                        setEvtIntvlActive(true);
                    }}
                    className="week-view__events"
                ></td>
            ))}
        </tr>
    );
}

function WeekViewGrid() {
    const { viewDate } = useStore();
    const eachDay = eachDayInWeek(viewDate);

    return (
        <Fragment>
            <WeekViewDayRow eachDay={eachDay} />
            <WeekViewWholeDayRow eachDay={eachDay} />
            {range(0, 24).map((h, i) => (
                <WeekViewHourRow key={i} hour={h} eachDay={eachDay} />
            ))}
        </Fragment>
    );
}

function WeekViewDefineCols() {
    return (
        <thead className="week-view__define-cols">
            <tr>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
                <th className="week-view__define-col"></th>
            </tr>
        </thead>
    );
}

export default function WeekView() {
    return (
        <table className="week-view">
            <WeekViewDefineCols />
            <tbody>
                <WeekViewHeader />
                <WeekViewGrid />
            </tbody>
        </table>
    );
}
