import React from "react";
import { Link } from "react-router-dom";

import { useStorePick } from "../store";
import { dateToFmt } from "../utils/dates";

export function DayViewLink() {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/day/${dateToFmt(viewDate)}`}>Day</Link>;
}

export function WeekViewLink() {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/week/${dateToFmt(viewDate)}`}>Week</Link>;
}

export function MonthViewLink() {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/month/${dateToFmt(viewDate)}`}>Month</Link>;
}
