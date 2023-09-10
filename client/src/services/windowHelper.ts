import { startOfDay, differenceInMinutes } from "./dates";
import { CalInterval } from "../types";

export class WindowHelper {
    private minInPixel: number;
    constructor(height: number) {
        this.minInPixel = height / 60;
    }
    getDimensions(interval: CalInterval) {
        const minStart = differenceInMinutes(
            interval.start,
            startOfDay(interval.start)
        );
        const minDist = differenceInMinutes(interval.end, interval.start);
        return {
            top: minStart * this.minInPixel,
            height: minDist * this.minInPixel,
        };
    }
    pixelDiffToMins(pixelDiff: number) {
        return pixelDiff / this.minInPixel;
    }
}
