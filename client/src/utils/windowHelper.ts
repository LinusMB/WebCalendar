import { startOfDay, differenceInMinutes } from "../utils/dates";
import { CellInfo, CalInterval } from "../types";

export class WindowHelper {
    private cellInfo: CellInfo;
    private minInPixel: number;
    constructor(cellInfo: CellInfo) {
        this.cellInfo = cellInfo;
        this.minInPixel = cellInfo.height / 60;
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
