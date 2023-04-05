export interface CalInterval {
    start: Date;
    end: Date;
}

export interface CalEvent extends CalInterval {
    title: string;
    description: string;
}

export interface CellInfo {
    height: number;
    width: number;
    left: number;
    top: number;
}
