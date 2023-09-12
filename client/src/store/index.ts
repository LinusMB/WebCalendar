import { create } from "zustand";
import { pick } from "ramda";

import { EventFilterSlice, createEventFilterSlice } from "./event-filter-slice";
import {
	EventIntervalSlice,
	createEventIntervalSlice,
} from "./event-interval-slice";
import { ViewDateSlice, createViewDateSlice } from "./view-date-slice";

type Store = EventFilterSlice & EventIntervalSlice & ViewDateSlice;

export const useStore = create<Store>((...a) => ({
	...createEventFilterSlice(...a),
	...createEventIntervalSlice(...a),
	...createViewDateSlice(...a),
}));

export function useStorePick<T extends keyof Store>(...keys: T[]) {
	return useStore((state) => pick(keys, state));
}

export const useIsEventIntervalStartResizable = () =>
	useStore<[boolean, (resizable: boolean) => void]>((state) => [
		state.isEventIntervalStartResizable,
		state.setIsEventIntervalStartResizable,
	]);

export const useIsEventIntervalEndResizable = () =>
	useStore<[boolean, (resizable: boolean) => void]>((state) => [
		state.isEventIntervalEndResizable,
		state.setIsEventIntervalEndResizable,
	]);

export const useEventIntervalIncStart = () =>
	useStore((state) => state.incEventIntervalStart);
export const useEventIntervalDecStart = () =>
	useStore((state) => state.decEventIntervalStart);
export const useEventIntervalIncEnd = () =>
	useStore((state) => state.incEventIntervalEnd);
export const useEventIntervalDecEnd = () =>
	useStore((state) => state.decEventIntervalEnd);

export const useEventIntervalUpdateStart = () =>
	useStore((state) => state.updateEventIntervalStart);

export const useEventIntervalUpdateEnd = () =>
	useStore((state) => state.updateEventIntervalEnd);
