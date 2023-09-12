import React, {
    Fragment,
    useState,
    useRef,
    useEffect,
    forwardRef,
} from "react";
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
    incWeek,
    decWeek,
    getHourInterval,
    areIntervalsOverlapping,
    getDayInterval,
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
            <Table.Cell className="week-view__time week-view__day"></Table.Cell>
            {eachDay.map((d, i) => (
                <WeekViewDayCell key={i} date={d} />
            ))}
        </Table.Row>
    );
}

function _WeekViewHourRow(
    { hour, eachDay }: { hour: number; eachDay: Date[] },
    ref: React.ForwardedRef<HTMLDivElement[]>
) {
    const { setEventInterval, setIsEventIntervalActive } = useStorePick(
        "setEventInterval",
        "setIsEventIntervalActive"
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
            <Table.Cell className="week-view__time">
                <span className={isCurHour ? "text--present" : ""}>
                    {hour.toString().padStart(2, "0")}
                </span>
            </Table.Cell>
            {eachDay.map((d, i) => (
                <Table.Cell
                    key={i}
                    onClick={function () {
                        setEventInterval(getHourInterval(setHours(d, hour)));
                        setIsEventIntervalActive(true);
                        refetchPreviousEvents();
                        refetchNextEvents();
                    }}
                    className="week-view__event"
                    ref={function (el) {
                        if (!ref || !el) return undefined;
                        if (typeof ref === "function")
                            throw new Error(
                                `${_WeekViewHourRow.name} Unexpected ref type.`
                            );
                        (
                            ref as React.MutableRefObject<HTMLDivElement[]>
                        ).current[i] = el;
                    }}
                ></Table.Cell>
            ))}
        </Table.Row>
    );
}

const WeekViewHourRow = forwardRef(_WeekViewHourRow);

function WeekViewEventWindowsOnDay({
    viewDate,
    windowHelper,
}: {
    viewDate: Date;
    windowHelper: WindowHelper;
}) {
    const { eventInterval, isEventIntervalActive: isEventIntervalActive } =
        useStorePick("eventInterval", "isEventIntervalActive");

    const isShowEventInterval =
        isEventIntervalActive &&
        areIntervalsOverlapping(eventInterval, getDayInterval(viewDate));

    return (
        <Table.Cell className="week-view__event week-view__event--anchor">
            {windowHelper && (
                <Events viewDate={viewDate} windowHelper={windowHelper} />
            )}
            {windowHelper && isShowEventInterval && (
                <EventInterval
                    viewDate={viewDate}
                    windowHelper={windowHelper}
                />
            )}
        </Table.Cell>
    );
}

function WeekViewEventWindows({
    eachDay,
    windowHelperList,
}: {
    eachDay: Date[];
    windowHelperList: WindowHelper[];
}) {
    return (
        <Table.Row className="week-view__row week-view__row--anchor">
            <Table.Cell className="week-view__time week-view__time--anchor" />
            {eachDay.map((d, i) => (
                <WeekViewEventWindowsOnDay
                    viewDate={d}
                    windowHelper={windowHelperList[i]}
                />
            ))}
        </Table.Row>
    );
}

function WeekViewGrid() {
    const { viewDate } = useStorePick("viewDate");
    const eachDay = eachDayInWeek(viewDate);

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
            <WeekViewDayRow eachDay={eachDay} />
            <WeekViewEventWindows
                eachDay={eachDay}
                windowHelperList={windowHelperList}
            />
            {range(0, 24).map((h, i) => (
                <WeekViewHourRow
                    key={i}
                    hour={h}
                    eachDay={eachDay}
                    ref={h === 0 ? $cellList : undefined}
                />
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
