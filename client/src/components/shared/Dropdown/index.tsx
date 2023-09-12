import React, { useRef, useLayoutEffect } from "react";

import "./Styles.css";

export interface DropdownProps {
    items: string[];
    topIndex: number;
    onClickItem?: (arg: number) => void;
}

export default function Dropdown({
    items,
    topIndex,
    onClickItem = () => {},
}: DropdownProps) {
    const $ul = useRef<HTMLUListElement>(null);
    const $li = useRef<HTMLLIElement>(null);

    useLayoutEffect(() => {
        if ($ul.current && $li.current) {
            $ul.current.scrollTop = $li.current.offsetTop;
        }
    }, []);

    return (
        <ul ref={$ul} className="dropdown">
            {items.map((item, i) => (
                <li
                    {...(i === topIndex ? { ref: $li } : {})}
                    onClick={() => onClickItem(i)}
                    className="dropdown__item"
                >
                    {item}
                </li>
            ))}
        </ul>
    );
}
