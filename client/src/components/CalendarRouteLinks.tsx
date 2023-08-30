import React from "react";
import { Link } from "react-router-dom";

import { useStorePick } from "../store";
import { dateToFmt } from "../utils/dates";

export interface DayViewLinkProps {
    children: React.ReactNode;
}

export function DayViewLink({ children }: DayViewLinkProps) {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/day/${dateToFmt(viewDate)}`}>{children}</Link>;
}

export interface WeekViewLinkProps {
    children: React.ReactNode;
}

export function WeekViewLink({ children }: WeekViewLinkProps) {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/week/${dateToFmt(viewDate)}`}>{children}</Link>;
}

export interface MonthViewLinkProps {
    children: React.ReactNode;
}

export function MonthViewLink({ children }: MonthViewLinkProps) {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/month/${dateToFmt(viewDate)}`}>{children}</Link>;
}
