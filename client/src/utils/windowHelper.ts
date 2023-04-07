import { startOfDay, differenceInMinutes } from "../utils/dates";
import { CalInterval } from "../types";

interface CellInfo {
    height: number;
    width: number;
    left: number;
    top: number;
}

export class WindowHelper {
    private cellInfo: CellInfo;
    private minInPixel: number;
    constructor(height: number, width: number, left: number, top: number) {
        this.cellInfo = {
            height,
            width,
            left,
            top,
        };
        this.minInPixel = height / 60;
    }
    getDimensionsWholeDay() {
        return this.cellInfo;
    }
    getDimensions(intvl: CalInterval) {
        const minHeight = this.cellInfo.height / 60;
        const minStart = differenceInMinutes(
            intvl.start,
            startOfDay(intvl.start)
        );
        const minDist = differenceInMinutes(intvl.end, intvl.start);
        const ZeroHourStartPx = this.cellInfo.top + this.cellInfo.height;
        return {
            top: ZeroHourStartPx + minStart * minHeight,
            height: minDist * minHeight,
            width: this.cellInfo.width,
            left: this.cellInfo.left,
        };
    }
    pixelDiffToMins(pixelDiff: number) {
        return pixelDiff / this.minInPixel;
    }
}
