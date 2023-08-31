export interface CalInterval {
    start: Date;
    end: Date;
}

export interface CalEvent extends CalInterval {
    title: string;
    description: string;
    uuid: string;
}

export type View = "day" | "week" | "month";

export type Moment = "past" | "present" | "future";
