import React, { Fragment } from "react";
import { pick } from "ramda";

import Window from "./Window";
import { WindowHelper } from "../utils/windowHelper";
import { clampToDayIntvl } from "../utils/dates";
import { useEvtsForDay } from "../store";

export interface EventsProps {
    viewDate: Date;
    windowHelper: WindowHelper | null;
}

export default function Events({ viewDate, windowHelper }: EventsProps) {
    if (!windowHelper) return null;

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
