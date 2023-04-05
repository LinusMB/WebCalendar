import React from "react";

import EventInterval from "./EventInterval";
import { useStore } from "../store";
import {
    intvlBelongsToDayBlock,
    isSameDay,
    isWholeDayIntvl,
} from "../utils/dates";
import { CellInfo } from "../types";

interface ViewEventIntervalProps {
    viewDate: Date;
    cellInfo: CellInfo | null;
}

export default function ViewEventInterval({
    viewDate,
    cellInfo,
}: ViewEventIntervalProps) {
    if (!cellInfo || !Object.keys(cellInfo).length) return null;

    const { evtIntvl } = useStore();
    if (isSameDay(viewDate, evtIntvl.start) && isWholeDayIntvl(evtIntvl)) {
        return (
            <EventInterval
                viewDate={viewDate}
                intvl={evtIntvl}
                cellInfo={cellInfo}
                wholeDay
            />
        );
    }
    if (intvlBelongsToDayBlock(evtIntvl, viewDate)) {
        return (
            <EventInterval
                viewDate={viewDate}
                intvl={evtIntvl}
                cellInfo={cellInfo}
                resizable
            />
        );
    }
    return null;
}
