import React from "react";
import { now } from "../utils/dates";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { DayViewLink, WeekViewLink, MonthViewLink } from "./ChangeView";
import { useStore } from "../store";
import "./ViewHeader.css";

interface ViewHeaderProps {
    dateStr: string;
    onClickLeftChv: () => void;
    onClickRightChv: () => void;
}

export default function ViewHeader({
    dateStr,
    onClickLeftChv,
    onClickRightChv,
}: ViewHeaderProps) {
    const { setViewDate } = useStore();

    return (
        <div className="view-header">
            <button
                onClick={() => setViewDate(now())}
                className="view-header__today"
            >
                Today
            </button>
            <i
                onClick={onClickLeftChv}
                className="view-header__dec fas fa-angle-left"
            ></i>
            <i
                onClick={onClickRightChv}
                className="view-header__inc fas fa-angle-right"
            ></i>
            <span className="view-header__date">{dateStr}</span>
            <div className="view-header__link-group">
                <button className="view-header__link">
                    <DayViewLink />
                </button>
                <button className="view-header__link">
                    <WeekViewLink />
                </button>
                <button className="view-header__link">
                    <MonthViewLink />
                </button>
            </div>
        </div>
    );
}
