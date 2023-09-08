export interface CalInterval {
    start: Date;
    end: Date;
}

export function isCalInterval(value: any): value is CalInterval {
    return "start" in value && "end" in value;
}

export interface CalEvent extends CalInterval {
    title: string;
    description: string;
    uuid: string;
}

export function isCalEvent(value: any): value is CalEvent {
    return (
        "title" in value &&
        "description" in value &&
        "uuid" in value &&
        "start" in value &&
        "end" in value
    );
}

export function isArrayOfCalEvents(value: any): value is CalEvent[] {
    return Array.isArray(value) && value.every((item) => isCalEvent(item));
}

export type View = "day" | "week" | "month";
export type Moment = "past" | "present" | "future";
