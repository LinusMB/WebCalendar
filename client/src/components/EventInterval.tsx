import React from "react";

import { INTVL_RESIZE_MIN_MULT } from "../constants";
import Window from "./Window";
import { WindowHelper } from "../utils/windowHelper";
import {
    useStore,
    useIsResizeStartActive,
    useIsResizeEndActive,
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
import { CellInfo } from "../types";

interface EventIntervalProps {
    viewDate: Date;
    cellInfo: CellInfo | null;
}

export default function EventInterval({
    viewDate,
    cellInfo,
}: EventIntervalProps) {
    if (!cellInfo) return null;

    const windowHelper = new WindowHelper(cellInfo);

    const { evtIntvl } = useStore();

    const evts = useEvtsForDay(viewDate);

    const incStart = useEvtIntvlIncStart(
        INTVL_RESIZE_MIN_MULT,
        getDayIntvl(viewDate)
    );
    const decStart = useEvtIntvlDecStart(getDayIntvl(viewDate), evts);
    const incEnd = useEvtIntvlIncEnd(getDayIntvl(viewDate), evts);
    const decEnd = useEvtIntvlDecEnd(
        INTVL_RESIZE_MIN_MULT,
        getDayIntvl(viewDate)
    );

    let onDragTopBar: (pixelDiff: number) => void;
    {
        let remainder = 0;
        onDragTopBar = function (pixelDiff: number) {
            const mins = windowHelper.pixelDiffToMins(pixelDiff) + remainder;
            remainder = mins % INTVL_RESIZE_MIN_MULT;
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
            remainder = mins % INTVL_RESIZE_MIN_MULT;
            const minsRounded = mins - remainder;
            if (mins < 0) {
                decEnd(Math.abs(minsRounded));
            } else if (mins > 0) {
                incEnd(minsRounded);
            }
        };
    }

    if (isSameDay(viewDate, evtIntvl.start) && isWholeDayIntvl(evtIntvl)) {
        return <Window dimensions={cellInfo} />;
    }
    if (!intvlBelongsToDayIntvl(evtIntvl, viewDate)) return null;

    return (
        <Window
            dimensions={windowHelper.getDimensions(
                clampToDayIntvl(evtIntvl, viewDate)
            )}
            onDragTopBar={onDragTopBar}
            onDragBottomBar={onDragBottomBar}
            useIsResizeTopActive={useIsResizeStartActive}
            useIsResizeBottomActive={useIsResizeEndActive}
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
