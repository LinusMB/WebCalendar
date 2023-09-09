import React, { Fragment, useState, useRef, useEffect } from "react";
import { range } from "ramda";

import { EventsProvider } from "../context/events";
import EventInterval from "./EventInterval";
import Events from "./Events";
import Table from "./Table";
import CalendarHeader from "./CalendarHeader";
import { WindowHelper } from "../services/windowHelper";
import { useStorePick } from "../store";
import {
    weekdayMap,
    wholeDayInterval,
    formatDate,
    getDay,
    incDay,
    decDay,
    getHourInterval,
    setHours,
    momentDay,
    momentHour,
} from "../services/dates";
import {
    refetchPreviousEvents,
    refetchNextEvents,
} from "../react-query/invalidate";

import "./DayView.css";

function DayViewHeader() {
    const { viewDate, updateViewDate } = useStorePick(
        "viewDate",
        "updateViewDate"
    );

    const dateStr = `${weekdayMap.get(getDay(viewDate))} ${formatDate(
        viewDate
    )}`;
    function onClickLeftChv() {
        updateViewDate(decDay);
    }
    function onClickRightChv() {
        updateViewDate(incDay);
    }

    return (
        <Table.Row className="day-view__header">
            <CalendarHeader
                dateStr={dateStr}
                moment={momentDay(viewDate)}
                onClickLeftChv={onClickLeftChv}
                onClickRightChv={onClickRightChv}
            />
        </Table.Row>
    );
}

function DayViewWholeDayRow() {
    const {
        viewDate,
        setEventInterval,
        isEventIntervalVisible,
        setIsEventIntervalVisible,
    } = useStorePick(
        "viewDate",
        "setEventInterval",
        "isEventIntervalVisible",
        "setIsEventIntervalVisible"
    );

    const [windowHelper, setWindowHelper] = useState<WindowHelper | null>(null);
    const $cell = useRef<HTMLDivElement>(null);
    function updateWindowHelper() {
        if ($cell.current) {
            const rect = $cell.current.getBoundingClientRect();
            setWindowHelper(new WindowHelper(rect.height));
        }
    }
    useEffect(() => {
        updateWindowHelper();
        window.addEventListener("resize", updateWindowHelper);
        return () => {
            window.removeEventListener("resize", updateWindowHelper);
        };
    }, []);

    return (
        <Fragment>
            <Table.Row className="day-view__row">
                <Table.Cell className="day-view__left">Whole Day</Table.Cell>
                <Table.Cell
                    onClick={function (e) {
                        if (!$cell.current) return;
                        const { top, right, bottom, left } =
                            $cell.current.getBoundingClientRect();
                        if (
                            e.clientX >= left &&
                            e.clientX <= right &&
                            e.clientY >= top &&
                            e.clientY <= bottom
                        ) {
                            setEventInterval(wholeDayInterval(viewDate));
                            setIsEventIntervalVisible(true);
                        }
                    }}
                    className="day-view__event day-view__event--whole-day"
                    ref={$cell}
                >
                    {windowHelper && (
                        <Fragment>
                            <Events
                                viewDate={viewDate}
                                windowHelper={windowHelper}
                            />
                            {isEventIntervalVisible && (
                                <EventInterval
                                    viewDate={viewDate}
                                    windowHelper={windowHelper}
                                />
                            )}
                        </Fragment>
                    )}
                </Table.Cell>
            </Table.Row>
        </Fragment>
    );
}

function DayViewHourRow({ hour }: { hour: number }) {
    const { viewDate, setEventInterval, setIsEventIntervalVisible } = useStorePick(
        "viewDate",
        "setEventInterval",
        "setIsEventIntervalVisible"
    );

    function computeIsCurHour(hour: number) {
        return momentHour(setHours(viewDate, hour)) === "present";
    }

    const [isCurHour, setIsCurHour] = useState(computeIsCurHour(hour));

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsCurHour(computeIsCurHour(hour));
        }, 60 * 1000);

        return () => clearTimeout(timeout);
    }, [isCurHour, hour]);

    return (
        <Table.Row className="day-view__row">
            <Table.Cell className="day-view__left">
                <span className={isCurHour ? "text--present" : ""}>
                    {hour.toString().padStart(2, "0")}
                </span>
            </Table.Cell>
            <Table.Cell
                onClick={function () {
                    setEventInterval(getHourInterval(setHours(viewDate, hour)));
                    setIsEventIntervalVisible(true);
                    refetchPreviousEvents();
                    refetchNextEvents();
                }}
                className="day-view__event"
            ></Table.Cell>
        </Table.Row>
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
    const { viewDate } = useStorePick("viewDate");

    return (
        <EventsProvider view="day" viewDate={viewDate}>
            <Table className="day-view">
                <DayViewHeader />
                <DayViewGrid />
            </Table>
        </EventsProvider>
    );
}
