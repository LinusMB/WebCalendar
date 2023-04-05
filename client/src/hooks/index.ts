import {
    useState,
    useEffect,
    useMemo,
    useRef,
    ChangeEvent,
    EffectCallback,
    DependencyList,
} from "react";
import { dequal } from "dequal";

type UseInput<T extends HTMLInputElement | HTMLTextAreaElement> = [
    string,
    (arg: ChangeEvent<T>) => void,
    () => void
];

export function useInput<T extends HTMLInputElement | HTMLTextAreaElement>(
    initialValue: string = ""
): UseInput<T> {
    const [value, setValue] = useState(initialValue);
    function onChange(e: ChangeEvent<T>) {
        setValue(e.target.value);
    }
    function reset() {
        setValue(initialValue);
    }
    return [value, onChange, reset];
}

function useComparator(
    dependencies: DependencyList,
    compare: (a: DependencyList, b: DependencyList) => boolean
) {
    const ref = useRef<DependencyList>([]);
    if (!compare(ref.current, dependencies)) {
        ref.current = dependencies;
    }
    return ref.current;
}

export function useDeepCompareMemo<T>(
    create: () => T,
    dependencies: DependencyList
) {
    return useMemo(create, useComparator(dependencies, dequal));
}

export function useDeepCompareEffect(
    effect: EffectCallback,
    dependencies: DependencyList
) {
    return useEffect(effect, useComparator(dependencies, dequal));
}
