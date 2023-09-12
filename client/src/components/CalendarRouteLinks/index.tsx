import React from "react";
import { Link } from "react-router-dom";

import { useStorePick } from "../../store";
import { formatDate } from "../../services/dates";

export interface DayViewLinkProps {
    children: React.ReactNode;
}

export function DayViewLink({ children }: DayViewLinkProps) {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/day/${formatDate(viewDate)}`}>{children}</Link>;
}

export interface WeekViewLinkProps {
    children: React.ReactNode;
}

export function WeekViewLink({ children }: WeekViewLinkProps) {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/week/${formatDate(viewDate)}`}>{children}</Link>;
}

export interface MonthViewLinkProps {
    children: React.ReactNode;
}

export function MonthViewLink({ children }: MonthViewLinkProps) {
    const { viewDate } = useStorePick("viewDate");
    return <Link to={`/month/${formatDate(viewDate)}`}>{children}</Link>;
}
