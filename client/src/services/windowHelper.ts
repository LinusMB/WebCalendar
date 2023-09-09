import { startOfDay, differenceInMinutes } from "./dates";
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
    getDimensions(interval: CalInterval) {
        const minStart = differenceInMinutes(
            interval.start,
            startOfDay(interval.start)
        );
        const minDist = differenceInMinutes(interval.end, interval.start);
        return {
            top: this.cellHeight + minStart * this.minInPixel,
            height: minDist * this.minInPixel,
        };
    }
    pixelDiffToMins(pixelDiff: number) {
        return pixelDiff / this.minInPixel;
    }
}
