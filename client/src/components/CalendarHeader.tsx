import React from "react";
import { now } from "../utils/dates";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { DayViewLink, WeekViewLink, MonthViewLink } from "./CalendarRouteLinks";
import { useStorePick } from "../store";
import "./CalendarHeader.css";

export interface CalendarHeaderProps {
    dateStr: string;
    onClickLeftChv: () => void;
    onClickRightChv: () => void;
}

export default function CalendarHeader({
    dateStr,
    onClickLeftChv,
    onClickRightChv,
}: CalendarHeaderProps) {
    const { setViewDate } = useStorePick("setViewDate");

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
                <DayViewLink>
                    <button className="calendar-header__link">Day</button>
                </DayViewLink>
                <WeekViewLink>
                    <button className="calendar-header__link">Week</button>
                </WeekViewLink>
                <MonthViewLink>
                    <button className="calendar-header__link">Month</button>
                </MonthViewLink>
            </div>
        </div>
    );
}
