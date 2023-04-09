import { startOfDay, differenceInMinutes } from "../utils/dates";
import { CalInterval } from "../types";

export class WindowHelper {
    private minInPixel: number;
    private cellHeight: number;
    constructor(height: number) {
        this.cellHeight = height;
        this.minInPixel = height / 60;
    }
    getDimensionsWholeDay() {
        return {
            top: 0,
            height: this.cellHeight,
        };
    }
    getDimensions(intvl: CalInterval) {
        const minStart = differenceInMinutes(
            intvl.start,
            startOfDay(intvl.start)
        );
        const minDist = differenceInMinutes(intvl.end, intvl.start);
        return {
            top: this.cellHeight + minStart * this.minInPixel,
            height: minDist * this.minInPixel,
        };
    }
    pixelDiffToMins(pixelDiff: number) {
        return pixelDiff / this.minInPixel;
    }
}
