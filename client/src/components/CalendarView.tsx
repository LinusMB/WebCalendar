import React, { Fragment } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useStore } from "../store";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import { dateToFmt } from "../utils/dates";

export default function CalendarView() {
    const { viewDate } = useStore();
    return (
        <Fragment>
            <Routes>
                <Route path="/day/:date" element={<DayView />} />
                <Route path="/week/:date" element={<WeekView />} />
                <Route path="/month/:date" element={<MonthView />} />
                <Route
                    path="/"
                    element={
                        <Navigate replace to={`/day/${dateToFmt(viewDate)}`} />
                    }
                />
            </Routes>
        </Fragment>
    );
}
