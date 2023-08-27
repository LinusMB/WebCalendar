import React, { Fragment, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { range } from "ramda";

import { EventsProvider } from "../context/events";
import EventInterval from "./EventInterval";
import Events from "./Events";
import Table from "./Table";
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
        <Table.Row className="week-view__header">
            <CalendarHeader
                dateStr={dateStr}
                onClickLeftChv={onClickLeftChv}
                onClickRightChv={onClickRightChv}
            />
        </Table.Row>
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
        <Table.Cell onClick={onClickHandler} className="week-view__day">
            {dateStr}
        </Table.Cell>
    );
}

function WeekViewDayRow({ eachDay }: { eachDay: Date[] }) {
    return (
        <Table.Row className="week-view__row">
            <Table.Cell className="week-view__left week-view__day"></Table.Cell>
            {eachDay.map((d, i) => (
                <WeekViewDayCell key={i} date={d} />
            ))}
        </Table.Row>
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
    const $cellList = useRef<HTMLDivElement[]>([]);
    function updateWindowHelperList() {
        const rects = $cellList.current.map((e) => e.getBoundingClientRect());
        setWindowHelperList(rects.map((r) => new WindowHelper(r.height)));
    }
    useEffect(() => {
        updateWindowHelperList();
        window.addEventListener("resize", updateWindowHelperList);
        return () => {
            window.removeEventListener("resize", updateWindowHelperList);
        };
    }, []);

    return (
        <Fragment>
            <Table.Row className="week-view__row">
                <Table.Cell className="week-view__left">Whole Day</Table.Cell>
                {eachDay.map((d, i) => (
                    <Table.Cell
                        key={i}
                        onClick={function (e) {
                            if (!$cellList.current[i]) return;
                            const { top, right, bottom, left } =
                                $cellList.current[i].getBoundingClientRect();
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
                            if (el) $cellList.current[i] = el;
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
                    </Table.Cell>
                ))}
            </Table.Row>
        </Fragment>
    );
}

function WeekViewHourRow({ hour, eachDay }: { hour: number; eachDay: Date[] }) {
    const { setEvtIntvl, setIsEvtIntvlVisible } = useStorePick(
        "setEvtIntvl",
        "setIsEvtIntvlVisible"
    );

    return (
        <Table.Row className="week-view__row">
            <Table.Cell className="week-view__left">
                {hour.toString().padStart(2, "0")}
            </Table.Cell>
            {eachDay.map((d, i) => (
                <Table.Cell
                    key={i}
                    onClick={function () {
                        setEvtIntvl(dateToHourIntvl(setHours(d, hour)));
                        setIsEvtIntvlVisible(true);
                    }}
                    className="week-view__events"
                ></Table.Cell>
            ))}
        </Table.Row>
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

export default function WeekView() {
    const { viewDate } = useStorePick("viewDate");

    return (
        <EventsProvider view="week" viewDate={viewDate}>
            <Table className="week-view">
                <WeekViewHeader />
                <WeekViewGrid />
            </Table>
        </EventsProvider>
    );
}
