import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";

import { useStorePick } from "../store";
import CalendarHeader from "./CalendarHeader";
import Table from "./Table";
import {
    getMonth,
    getYear,
    monthMap,
    eachWeekInMonth,
    getDate,
    incMonth,
    decMonth,
    dateToFmt,
    momentMonth,
    momentDay,
} from "../utils/dates";

import "./MonthView.css";

function MonthViewHeader() {
    const { viewDate, updateViewDate } = useStorePick(
        "viewDate",
        "updateViewDate"
    );

    const dateStr = `${monthMap[getMonth(viewDate)]} ${getYear(viewDate)}`;
    function onClickLeftChv() {
        updateViewDate(decMonth);
    }
    function onClickRightChv() {
        updateViewDate(incMonth);
    }

    return (
        <Table.Row className="month-view__header">
            <CalendarHeader
                dateStr={dateStr}
                moment={momentMonth(viewDate)}
                onClickLeftChv={onClickLeftChv}
                onClickRightChv={onClickRightChv}
            />
        </Table.Row>
    );
}

function MonthViewDayCell({ date }: { date: Date }) {
    const navigate = useNavigate();
    const { setViewDate } = useStorePick("setViewDate");

    function onClickHandler() {
        setViewDate(date);
        navigate(`/day/${dateToFmt(date)}`);
    }

    const dateStr = getDate(date);

    return (
        <Table.Cell onClick={onClickHandler} className="month-view__events">
            <span className={`text--${momentDay(date)}`}>{dateStr}</span>
        </Table.Cell>
    );
}

function MonthViewGrid() {
    const { viewDate } = useStorePick("viewDate");
    const eachWeek = eachWeekInMonth(viewDate);

    return (
        <Fragment>
            <Table.Row className="month-view__row">
                <Table.Cell className="month-view__day">Mon</Table.Cell>
                <Table.Cell className="month-view__day">Tue</Table.Cell>
                <Table.Cell className="month-view__day">Wed</Table.Cell>
                <Table.Cell className="month-view__day">Thu</Table.Cell>
                <Table.Cell className="month-view__day">Fri</Table.Cell>
                <Table.Cell className="month-view__day">Sat</Table.Cell>
                <Table.Cell className="month-view__day">Sun</Table.Cell>
            </Table.Row>
            {eachWeek.map((w) => (
                <Table.Row className="month-view__row">
                    {w.map((d) => (
                        <MonthViewDayCell date={d} />
                    ))}
                </Table.Row>
            ))}
        </Fragment>
    );
}

export default function MonthView() {
    return (
        <Table className="month-view">
            <MonthViewHeader />
            <MonthViewGrid />
        </Table>
    );
}
