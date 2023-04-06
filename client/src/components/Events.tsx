import React, { Fragment } from "react";
import { pick } from "ramda";

import Window from "./Window";
import { WindowHelper } from "../utils/windowHelper";
import { clampToDayIntvl } from "../utils/dates";
import { useEvtsForDay } from "../store";
import { CellInfo } from "../types";

export interface EventsProps {
    viewDate: Date;
    cellInfo: CellInfo | null;
}

export default function Events({ viewDate, cellInfo }: EventsProps) {
    if (!cellInfo) return null;

    const windowHelper = new WindowHelper(cellInfo);

    const evts = useEvtsForDay(viewDate);
    return (
        <Fragment>
            {evts.map((e) => (
                <Window
                    dimensions={windowHelper.getDimensions(
                        clampToDayIntvl(pick(["start", "end"], e), viewDate)
                    )}
                >
                    {e.title}
                </Window>
            ))}
        </Fragment>
    );
}
