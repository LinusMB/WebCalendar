import React, { Fragment, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { range } from "ramda";

import { EventsProvider } from "../context/events";
import EventInterval from "./EventInterval";
import Events from "./Events";
import CalendarHeader from "./CalendarHeader";
import { WindowHelper } from "../utils/windowHelper";
import { useStorePick } from "../store";
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

import "./WeekView.css";

function WeekViewHeader() {
    const { viewDate, updateViewDate } = useStorePick(
        "viewDate",
        "updateViewDate"
    );

    const dateStr = `Week ${getWeek(viewDate, {
        weekStartsOn: 1,
        firstWeekContainsDate: 7,
    })}, ${getYear(viewDate)}`;

    function onClickLeftChv() {
        updateViewDate(decWeek);
    }
    function onClickRightChv() {
        updateViewDate(incWeek);
    }

    return (
        <tr className="week-view__row">
            <td className="week-view__header" colSpan={8}>
                <CalendarHeader
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
    const { setViewDate } = useStorePick("setViewDate");

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
    const { setEvtIntvl, isEvtIntvlVisible, setIsEvtIntvlVisible } =
        useStorePick(
            "setEvtIntvl",
            "isEvtIntvlVisible",
            "setIsEvtIntvlVisible"
        );

    const [windowHelperList, setWindowHelperList] = useState<WindowHelper[]>(
        []
    );
    const $tdList = useRef<HTMLTableCellElement[]>([]);
    function updateWindowHelperList() {
        const rects = $tdList.current.map((e) => e.getBoundingClientRect());
        setWindowHelperList(rects.map((r) => new WindowHelper(r.height)));
    }
    useEffect(() => {
        updateWindowHelperList();
        window.addEventListener("resize", updateWindowHelperList);
        window.addEventListener("scroll", updateWindowHelperList);
        return () => {
            window.removeEventListener("resize", updateWindowHelperList);
            window.removeEventListener("scroll", updateWindowHelperList);
        };
    }, []);

    return (
        <Fragment>
            <tr className="week-view__row">
                <td className="week-view__time">Whole Day</td>
                {eachDay.map((d, i) => (
                    <td
                        key={i}
                        onClick={function (e) {
                            if (!$tdList.current[i]) return;
                            const { top, right, bottom, left } =
                                $tdList.current[i].getBoundingClientRect();
                            if (
                                e.clientX >= left &&
                                e.clientX <= right &&
                                e.clientY >= top &&
                                e.clientY <= bottom
                            ) {
                                setEvtIntvl(wholeDayIntvl(d));
                                setIsEvtIntvlVisible(true);
                            }
                        }}
                        className="week-view__events week-view__events--whole-day"
                        ref={(el) => {
                            if (el) $tdList.current[i] = el;
                        }}
                    >
                        {windowHelperList[i] && (
                            <Fragment>
                                <Events
                                    viewDate={d}
                                    windowHelper={windowHelperList[i]}
                                />
                                {isEvtIntvlVisible && (
                                    <EventInterval
                                        viewDate={d}
                                        windowHelper={windowHelperList[i]}
                                    />
                                )}
                            </Fragment>
                        )}
                    </td>
                ))}
            </tr>
        </Fragment>
    );
}

function WeekViewHourRow({ hour, eachDay }: { hour: number; eachDay: Date[] }) {
    const { setEvtIntvl, setIsEvtIntvlVisible } = useStorePick(
        "setEvtIntvl",
        "setIsEvtIntvlVisible"
    );

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
                        setIsEvtIntvlVisible(true);
                    }}
                    className="week-view__events"
                ></td>
            ))}
        </tr>
    );
}

function WeekViewGrid() {
    const { viewDate } = useStorePick("viewDate");
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
    const { viewDate } = useStorePick("viewDate");

    return (
        <EventsProvider view="Week" viewDate={viewDate}>
            <table className="week-view">
                <WeekViewDefineCols />
                <tbody>
                    <WeekViewHeader />
                    <WeekViewGrid />
                </tbody>
            </table>
        </EventsProvider>
    );
}
