import React, {
    Fragment,
    useState,
    useRef,
    useEffect,
    forwardRef,
} from "react";
import { range } from "ramda";

import { EventsProvider } from "../../context/events";
import EventInterval from "../EventInterval";
import Events from "../Events";
import Table from "../shared/Table";
import CalendarHeader from "../CalendarHeader";
import { WindowHelper } from "../../services/windowHelper";
import { useStorePick } from "../../store";
import {
    weekdayMap,
    areIntervalsOverlapping,
    getDayInterval,
    formatDate,
    getDay,
    incDay,
    decDay,
    getHourInterval,
    setHours,
    momentDay,
    momentHour,
} from "../../services/dates";
import {
    refetchPreviousEvents,
    refetchNextEvents,
} from "../../react-query/invalidate";

import "./Styles.css";

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

function _DayViewHourRow(
    { hour }: { hour: number },
    ref: React.ForwardedRef<HTMLDivElement>
) {
    const { viewDate, setEventInterval, setIsEventIntervalActive } =
        useStorePick(
            "viewDate",
            "setEventInterval",
            "setIsEventIntervalActive"
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
            <Table.Cell className="day-view__time">
                <span className={isCurHour ? "text--present" : ""}>
                    {hour.toString().padStart(2, "0")}
                </span>
            </Table.Cell>
            <Table.Cell
                onClick={function () {
                    setEventInterval(getHourInterval(setHours(viewDate, hour)));
                    setIsEventIntervalActive(true);
                    refetchPreviousEvents();
                    refetchNextEvents();
                }}
                className="day-view__event"
                ref={ref}
            ></Table.Cell>
        </Table.Row>
    );
}

const DayViewHourRow = forwardRef(_DayViewHourRow);

function EventWindowContainer({
    windowHelper,
}: {
    windowHelper: WindowHelper | null;
}) {
    const {
        viewDate,
        eventInterval,
        isEventIntervalActive: isEventIntervalActive,
    } = useStorePick("viewDate", "eventInterval", "isEventIntervalActive");

    const isShowEventInterval =
        isEventIntervalActive &&
        areIntervalsOverlapping(eventInterval, getDayInterval(viewDate));

    return (
        <Table.Row className="day-view__row day-view__row--anchor">
            <Table.Cell className="day-view__time day-view__time--anchor" />
            <Table.Cell className="day-view__event day-view__event--anchor">
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
        </Table.Row>
    );
}

function DayViewGrid() {
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
            <EventWindowContainer windowHelper={windowHelper} />
            {range(0, 24).map((h, i) => (
                <DayViewHourRow key={i} hour={h} ref={h === 0 ? $cell : null} />
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
