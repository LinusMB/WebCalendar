import React from "react";

import { INTVL_MIN_RESIZE_STEP } from "../constants";
import Window from "./Window";
import { WindowHelper } from "../utils/windowHelper";
import {
    useStore,
    useIsEvtIntvlStartResizable,
    useIsEvtIntvlEndResizable,
    useEvtsForDay,
    useEvtIntvlIncStart,
    useEvtIntvlDecStart,
    useEvtIntvlIncEnd,
    useEvtIntvlDecEnd,
} from "../store";
import {
    intvlBelongsToDayIntvl,
    isSameDay,
    isWholeDayIntvl,
    clampToDayIntvl,
    getDayIntvl,
    isWithinInterval,
} from "../utils/dates";
import { CalInterval } from "../types";

export interface EventIntervalProps {
    viewDate: Date;
    windowHelper: WindowHelper;
}

export default function EventInterval({
    viewDate,
    windowHelper,
}: EventIntervalProps) {
    const { evtIntvl } = useStore();

    if (isSameDay(viewDate, evtIntvl.start) && isWholeDayIntvl(evtIntvl)) {
        return <EventIntervalWholeDay windowHelper={windowHelper} />;
    }

    if (!intvlBelongsToDayIntvl(evtIntvl, viewDate)) return null;

    return (
        <EventIntervalResizable
            viewDate={viewDate}
            windowHelper={windowHelper}
            evtIntvl={evtIntvl}
        />
    );
}

function EventIntervalWholeDay({
    windowHelper,
}: {
    windowHelper: WindowHelper;
}) {
    return <Window dimensions={windowHelper.getDimensionsWholeDay()} />;
}

interface EventIntervalResizableProps extends EventIntervalProps {
    evtIntvl: CalInterval;
}

function EventIntervalResizable({
    viewDate,
    windowHelper,
    evtIntvl,
}: EventIntervalResizableProps) {
    const evts = useEvtsForDay(viewDate);

    const incStart = useEvtIntvlIncStart(
        INTVL_MIN_RESIZE_STEP,
        getDayIntvl(viewDate)
    );
    const decStart = useEvtIntvlDecStart(getDayIntvl(viewDate), evts);
    const incEnd = useEvtIntvlIncEnd(getDayIntvl(viewDate), evts);
    const decEnd = useEvtIntvlDecEnd(
        INTVL_MIN_RESIZE_STEP,
        getDayIntvl(viewDate)
    );

    let onDragTopBar: (pixelDiff: number) => void;
    {
        let remainder = 0;
        onDragTopBar = function (pixelDiff: number) {
            const mins = windowHelper.pixelDiffToMins(pixelDiff) + remainder;
            remainder = mins % INTVL_MIN_RESIZE_STEP;
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
            remainder = mins % INTVL_MIN_RESIZE_STEP;
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
                clampToDayIntvl(evtIntvl, viewDate)
            )}
            onDragTopBar={onDragTopBar}
            onDragBottomBar={onDragBottomBar}
            useIsResizeTopActive={useIsEvtIntvlStartResizable}
            useIsResizeBottomActive={useIsEvtIntvlEndResizable}
            isTopResizable={isWithinInterval(
                evtIntvl.start,
                getDayIntvl(viewDate)
            )}
            isBottomResizable={isWithinInterval(
                evtIntvl.end,
                getDayIntvl(viewDate)
            )}
        />
    );
}
