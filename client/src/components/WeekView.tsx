import React, { Fragment, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { range } from "ramda";

import { EventsProvider } from "../context/events";
import EventInterval from "./EventInterval";
import Events from "./Events";
import Table from "./Table";
import CalendarHeader from "./CalendarHeader";
import { WindowHelper } from "../services/windowHelper";
import { useStorePick } from "../store";
import {
    getDay,
    getWeek,
    getYear,
    setHours,
    weekdayMap,
    formatDate,
    eachDayInWeek,
    wholeDayInterval,
    incWeek,
    decWeek,
    getHourInterval,
    momentHour,
    momentWeek,
    momentDay,
} from "../services/dates";
import {
    refetchPreviousEvents,
    refetchNextEvents,
} from "../react-query/invalidate";

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
                moment={momentWeek(viewDate)}
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
        navigate(`/day/${formatDate(date)}`);
    }

    const dateStr = `${weekdayMap.get(getDay(date))} ${formatDate(date)}`;

    return (
        <Table.Cell onClick={onClickHandler} className="week-view__day">
            <span className={`text--${momentDay(date)}`}>{dateStr}</span>
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
    const { setEventInterval, isEventIntervalVisible, setIsEventIntervalVisible } =
        useStorePick(
            "setEventInterval",
            "isEventIntervalVisible",
            "setIsEventIntervalVisible"
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
                                setEventInterval(wholeDayInterval(d));
                                setIsEventIntervalVisible(true);
                            }
                        }}
                        className="week-view__event week-view__event--whole-day"
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
                                {isEventIntervalVisible && (
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
    const { setEventInterval, setIsEventIntervalVisible } = useStorePick(
        "setEventInterval",
        "setIsEventIntervalVisible"
    );

    function computeIsCurHour(hour: number, eachDay: Date[]) {
        return eachDay.some((d) => momentHour(setHours(d, hour)) === "present");
    }

    const [isCurHour, setIsCurHour] = useState(computeIsCurHour(hour, eachDay));

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsCurHour(computeIsCurHour(hour, eachDay));
        }, 60 * 1000);

        return () => clearTimeout(timeout);
    }, [isCurHour, hour, eachDay]);

    return (
        <Table.Row className="week-view__row">
            <Table.Cell className="week-view__left">
                <span className={isCurHour ? "text--present" : ""}>
                    {hour.toString().padStart(2, "0")}
                </span>
            </Table.Cell>
            {eachDay.map((d, i) => (
                <Table.Cell
                    key={i}
                    onClick={function () {
                        setEventInterval(getHourInterval(setHours(d, hour)));
                        setIsEventIntervalVisible(true);
                        refetchPreviousEvents();
                        refetchNextEvents();
                    }}
                    className="week-view__event"
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
