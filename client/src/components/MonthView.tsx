import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import { useStore } from "../store";
import CalendarHeader from "./CalendarHeader";
import {
    getMonth,
    getYear,
    monthMap,
    eachWeekInMonth,
    getDate,
    incMonth,
    decMonth,
    dateToFmt,
} from "../utils/dates";

import "./MonthView.css";

function MonthViewHeader() {
    const { viewDate, updateViewDate } = useStore();

    const dateStr = `${monthMap[getMonth(viewDate)]} ${getYear(viewDate)}`;
    function onClickLeftChv() {
        updateViewDate(decMonth);
    }
    function onClickRightChv() {
        updateViewDate(incMonth);
    }

    return (
        <tr className="month-view__row">
            <td className="month-view__header" colSpan={7}>
                <CalendarHeader
                    dateStr={dateStr}
                    onClickLeftChv={onClickLeftChv}
                    onClickRightChv={onClickRightChv}
                />
            </td>
        </tr>
    );
}

function MonthViewDayCell({ date }: { date: Date }) {
    const navigate = useNavigate();
    const { setViewDate } = useStore();

    function onClickHandler() {
        setViewDate(date);
        navigate(`/day/${dateToFmt(date)}`);
    }

    const dateStr = getDate(date);

    return (
        <td onClick={onClickHandler} className="month-view__day-cell">
            {dateStr}
        </td>
    );
}

function MonthViewGrid() {
    const { viewDate } = useStore();
    const eachWeek = eachWeekInMonth(viewDate);

    return (
        <Fragment>
            <tr className="month-view__row">
                <td className="month-view__day-col">Mon</td>
                <td className="month-view__day-col">Tue</td>
                <td className="month-view__day-col">Wed</td>
                <td className="month-view__day-col">Thu</td>
                <td className="month-view__day-col">Fri</td>
                <td className="month-view__day-col">Sat</td>
                <td className="month-view__day-col">Sun</td>
            </tr>
            {eachWeek.map((w) => (
                <tr className="month-view__row">
                    {w.map((d) => (
                        <MonthViewDayCell date={d} />
                    ))}
                </tr>
            ))}
        </Fragment>
    );
}

export default function MonthView() {
    return (
        <table className="month-view">
            <tbody>
                <MonthViewHeader />
                <MonthViewGrid />
            </tbody>
        </table>
    );
}
