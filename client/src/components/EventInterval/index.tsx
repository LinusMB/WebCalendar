import React from "react";

import { INTERVAL_MIN_RESIZE_STEP } from "../../constants";
import Window from "../shared/Window";
import { WindowHelper } from "../../services/windowHelper";
import {
    useStorePick,
    useIsEventIntervalStartResizable,
    useIsEventIntervalEndResizable,
    useEventIntervalIncStart,
    useEventIntervalDecStart,
    useEventIntervalIncEnd,
    useEventIntervalDecEnd,
} from "../../store";
import {
    clampToDayInterval,
    getDayInterval,
    isWithinInterval,
} from "../../services/dates";
import { useGetPreviousEvents, useGetNextEvents } from "../../hooks/events";

export interface EventIntervalProps {
    viewDate: Date;
    windowHelper: WindowHelper;
}

export default function EventInterval({
    viewDate,
    windowHelper,
}: EventIntervalProps) {
    const { eventInterval } = useStorePick("eventInterval");

    const { data: prevEvents = [] } = useGetPreviousEvents(eventInterval);
    const { data: nextEvents = [] } = useGetNextEvents(eventInterval);

    const incStart = useEventIntervalIncStart()(
        getDayInterval(viewDate),
        INTERVAL_MIN_RESIZE_STEP
    );
    const decStart = useEventIntervalDecStart()(
        getDayInterval(viewDate),
        prevEvents
    );
    const incEnd = useEventIntervalIncEnd()(
        getDayInterval(viewDate),
        nextEvents
    );
    const decEnd = useEventIntervalDecEnd()(
        getDayInterval(viewDate),
        INTERVAL_MIN_RESIZE_STEP
    );

    let onDragTopBar: (pixelDiff: number) => void;
    {
        let remainder = 0;
        onDragTopBar = function (pixelDiff: number) {
            const mins = windowHelper.pixelDiffToMins(pixelDiff) + remainder;
            remainder = mins % INTERVAL_MIN_RESIZE_STEP;
            const minsRounded = mins - remainder;
            if (mins < 0) {
                decStart(Math.abs(minsRounded));
            } else if (mins > 0) {
                incStart(minsRounded);
            }
        };
    }

    let onDragBottomBar: (pixelDiff: number) => void;
    {
        let remainder = 0;
        onDragBottomBar = function (pixelDiff: number) {
            const mins = windowHelper.pixelDiffToMins(pixelDiff) + remainder;
            remainder = mins % INTERVAL_MIN_RESIZE_STEP;
            const minsRounded = mins - remainder;
            if (mins < 0) {
                decEnd(Math.abs(minsRounded));
            } else if (mins > 0) {
                incEnd(minsRounded);
            }
        };
    }

    return (
        <Window
            dimensions={windowHelper.getDimensions(
                clampToDayInterval(eventInterval, viewDate)
            )}
            onDragTopBar={onDragTopBar}
            onDragBottomBar={onDragBottomBar}
            useIsResizeTopActive={useIsEventIntervalStartResizable}
            useIsResizeBottomActive={useIsEventIntervalEndResizable}
            isTopResizable={isWithinInterval(
                eventInterval.start,
                getDayInterval(viewDate)
            )}
            isBottomResizable={isWithinInterval(
                eventInterval.end,
                getDayInterval(viewDate)
            )}
        />
    );
}
