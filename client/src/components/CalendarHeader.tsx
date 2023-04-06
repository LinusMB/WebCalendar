import React from "react";
import { now } from "../utils/dates";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { DayViewLink, WeekViewLink, MonthViewLink } from "./ChangeView";
import { useStore } from "../store";
import "./CalendarHeader.css";

interface CalendarHeaderProps {
    dateStr: string;
    onClickLeftChv: () => void;
    onClickRightChv: () => void;
}

export default function CalendarHeader({
    dateStr,
    onClickLeftChv,
    onClickRightChv,
}: CalendarHeaderProps) {
    const { setViewDate } = useStore();

    return (
        <div className="calendar-header">
            <button
                onClick={() => setViewDate(now())}
                className="calendar-header__today"
            >
                Today
            </button>
            <i
                onClick={onClickLeftChv}
                className="calendar-header__dec fas fa-angle-left"
            ></i>
            <i
                onClick={onClickRightChv}
                className="calendar-header__inc fas fa-angle-right"
            ></i>
            <span className="calendar-header__date">{dateStr}</span>
            <div className="calendar-header__link-group">
                <button className="calendar-header__link">
                    <DayViewLink />
                </button>
                <button className="calendar-header__link">
                    <WeekViewLink />
                </button>
                <button className="calendar-header__link">
                    <MonthViewLink />
                </button>
            </div>
        </div>
    );
}
