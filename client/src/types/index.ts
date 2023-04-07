export interface CalInterval {
    start: Date;
    end: Date;
}

export interface CalEvent extends CalInterval {
    title: string;
    description: string;
}
