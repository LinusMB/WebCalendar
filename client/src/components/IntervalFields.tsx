import React, { Fragment, useState } from "react";
import { pluck } from "ramda";

import Dropdown from "./Dropdown";
import {
    subYears,
    addYears,
    startOfYear,
    endOfYear,
    startOfMonth,
    endOfMonth,
    startOfDay,
    endOfDay,
    startOfHour,
    endOfHour,
    eachYearOfInterval,
    eachMonthOfInterval,
    eachDayOfInterval,
    eachHourOfInterval,
    eachMinuteOfInterval,
    differenceInMonths,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    getYear,
    setYear,
    getMonth,
    setMonth,
    getDate,
    setDate,
    getHours,
    setHours,
    getMinutes,
    setMinutes,
    format,
} from "../utils/dates";

import "./IntervalFields.css";

interface FieldProps {
    date: Date;
    isWholeDay: boolean;
    updateDate?: (arg: (arg: Date) => Date) => void;
    className?: string;
}

export function ToField({
    date,
    updateDate = () => {},
    isWholeDay,
    className = "",
}: FieldProps) {
    return (
        <div className={`interval-field ${className}`}>
            {"to "}
            <DateDisplay
                date={date}
                updateDate={updateDate}
                isWholeDay={isWholeDay}
            />
        </div>
    );
}

export function FromField({
    date,
    updateDate = () => {},
    isWholeDay,
    className = "",
}: FieldProps) {
    return (
        <div className={`interval-field ${className}`}>
            {"from "}
            <DateDisplay
                date={date}
                updateDate={updateDate}
                isWholeDay={isWholeDay}
            />
        </div>
    );
}

interface DateDisplayProps {
    date: Date;
    isWholeDay: boolean;
    updateDate: (arg: (arg: Date) => Date) => void;
}

function DateDisplay({ date, updateDate, isWholeDay }: DateDisplayProps) {
    return (
        <Fragment>
            <YearSelection date={date} updateDate={updateDate} />
            {"-"}
            <MonthSelection date={date} updateDate={updateDate} />
            {"-"}
            <DaySelection date={date} updateDate={updateDate} />
            {!isWholeDay && (
                <Fragment>
                    {" at "}
                    <HourSelection date={date} updateDate={updateDate} />
                    {":"}
                    <MinuteSelection date={date} updateDate={updateDate} />
                </Fragment>
            )}
        </Fragment>
    );
}

interface YearSelectionProps {
    date: Date;
    updateDate: (arg: (arg: Date) => Date) => void;
    fmt?: string;
    numYearsPast?: number;
    numYearsFuture?: number;
}

function YearSelection({
    date,
    updateDate,
    fmt = "yyyy",
    numYearsPast = 5,
    numYearsFuture = 5,
}: YearSelectionProps) {
    const intvl = {
        start: subYears(date, numYearsPast),
        end: addYears(date, numYearsFuture),
    };

    const items = eachYearOfInterval(intvl).map((d) => ({
        date: d,
        dateStr: format(d, fmt),
    }));

    const topIndex = numYearsPast;

    function onClickItem(i: number) {
        const year = getYear(items[i].date);
        updateDate((d) => setYear(d, year));
    }

    return (
        <DateSelection
            items={pluck("dateStr", items)}
            topIndex={topIndex}
            onClickItem={onClickItem}
        />
    );
}

interface MonthSelectionProps {
    date: Date;
    updateDate: (arg: (arg: Date) => Date) => void;
    fmt?: string;
}

function MonthSelection({ date, updateDate, fmt = "MM" }: MonthSelectionProps) {
    const intvl = {
        start: startOfYear(date),
        end: endOfYear(date),
    };

    const items = eachMonthOfInterval(intvl).map((d) => ({
        date: d,
        dateStr: format(d, fmt),
    }));

    const topIndex = differenceInMonths(date, startOfYear(date));

    function onClickItem(i: number) {
        const month = getMonth(items[i].date);
        updateDate((d) => setMonth(d, month));
    }

    return (
        <DateSelection
            items={pluck("dateStr", items)}
            topIndex={topIndex}
            onClickItem={onClickItem}
        />
    );
}

interface DaySelectionProps {
    date: Date;
    updateDate: (arg: (arg: Date) => Date) => void;
    fmt?: string;
}

function DaySelection({ date, updateDate, fmt = "dd" }: DaySelectionProps) {
    const intvl = {
        start: startOfMonth(date),
        end: endOfMonth(date),
    };

    const items = eachDayOfInterval(intvl).map((d) => ({
        date: d,
        dateStr: format(d, fmt),
    }));

    const topIndex = differenceInDays(date, startOfMonth(date));

    function onClickItem(i: number) {
        const day = getDate(items[i].date);
        updateDate((d) => setDate(d, day));
    }

    return (
        <DateSelection
            items={pluck("dateStr", items)}
            topIndex={topIndex}
            onClickItem={onClickItem}
        />
    );
}

interface HourSelectionProps {
    date: Date;
    updateDate: (arg: (arg: Date) => Date) => void;
    fmt?: string;
}

function HourSelection({ date, updateDate, fmt = "HH" }: HourSelectionProps) {
    const intvl = {
        start: startOfDay(date),
        end: endOfDay(date),
    };

    const items = eachHourOfInterval(intvl).map((d) => ({
        date: d,
        dateStr: format(d, fmt),
    }));

    const topIndex = differenceInHours(date, startOfDay(date));

    function onClickItem(i: number) {
        const hour = getHours(items[i].date);
        updateDate((d) => setHours(d, hour));
    }

    return (
        <DateSelection
            items={pluck("dateStr", items)}
            topIndex={topIndex}
            onClickItem={onClickItem}
        />
    );
}

interface MinuteSelectionProps {
    date: Date;
    updateDate: (arg: (arg: Date) => Date) => void;
    fmt?: string;
}

function MinuteSelection({
    date,
    updateDate,
    fmt = "mm",
}: MinuteSelectionProps) {
    const intvl = {
        start: startOfHour(date),
        end: endOfHour(date),
    };

    const items = eachMinuteOfInterval(intvl).map((d) => ({
        date: d,
        dateStr: format(d, fmt),
    }));

    const topIndex = differenceInMinutes(date, startOfHour(date));

    function onClickItem(i: number) {
        const minute = getMinutes(items[i].date);
        updateDate((d) => setMinutes(d, minute));
    }

    return (
        <DateSelection
            items={pluck("dateStr", items)}
            topIndex={topIndex}
            onClickItem={onClickItem}
        />
    );
}

interface DateSelectionProps {
    items: string[];
    topIndex: number;
    onClickItem?: (arg: number) => void;
}

function DateSelection({
    items,
    topIndex,
    onClickItem = () => {},
}: DateSelectionProps) {
    const [isDropdownActive, setIsDropdownActive] = useState(false);

    return (
        <span
            onClick={() => setIsDropdownActive((isActive) => !isActive)}
            className="interval-field__selection"
        >
            {items[topIndex]}
            {isDropdownActive && (
                <Dropdown
                    items={items}
                    topIndex={topIndex}
                    onClickItem={onClickItem}
                />
            )}
        </span>
    );
}
