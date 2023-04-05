import React, { Fragment } from "react";
import { pick } from "ramda";

import EventInterval from "./EventInterval";
import { useEvtsForDay } from "../store";
import { CellInfo } from "../types";

interface ViewEventsProps {
    viewDate: Date;
    cellInfo: CellInfo | null;
}

export default function ViewEvents({ viewDate, cellInfo }: ViewEventsProps) {
    if (!cellInfo || !Object.keys(cellInfo).length) return null;

    const evts = useEvtsForDay(viewDate);
    return (
        <Fragment>
            {evts.map((e) => (
                <EventInterval
                    viewDate={viewDate}
                    intvl={pick(["start", "end"], e)}
                    cellInfo={cellInfo}
                >
                    {e.title}
                </EventInterval>
            ))}
        </Fragment>
    );
}
