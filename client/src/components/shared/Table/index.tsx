import React from "react";

import "./Styles.css";

export interface TableProps extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
    className?: string;
}

const Table = ({ children, className, ...props }: TableProps) => {
    return (
        <div className={`table ${className}`} {...props}>
            {children}
        </div>
    );
};

export interface TableRowProps extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
    className?: string;
}

Table.Row = ({ children, className, ...props }: TableRowProps) => {
    return (
        <div className={`table__row ${className}`} {...props}>
            {children}
        </div>
    );
};

export interface TableCellProps extends React.ComponentPropsWithoutRef<"div"> {
    children?: React.ReactNode;
    className?: string;
}

Table.Cell = React.forwardRef<HTMLDivElement, TableCellProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={`table__cell ${className}`} {...props}>
                {children}
            </div>
        );
    }
);

export default Table;
