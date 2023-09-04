import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useStorePick } from "../store";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";
import { dateToFmt } from "../services/dates";

export default function CalendarRoutes() {
    const { viewDate } = useStorePick("viewDate");
    return (
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
    );
}
