import { StateCreator } from "zustand";
import { __ } from "ramda";

import {
	constraints,
	checkConstraints,
	zeroInterval,
	incStart,
	decStart,
	incEnd,
	decEnd,
	updateStart,
	updateEnd,
} from "../services/intervals";

import { CalEvent, CalInterval } from "../types";

export interface EventIntervalSlice {
	eventInterval: CalInterval;
	isEventIntervalActive: boolean;
	isEventIntervalStartResizable: boolean;
	isEventIntervalEndResizable: boolean;
	setEventInterval: (interval: CalInterval) => void;
	updateEventInterval: (update: (arg: CalInterval) => CalInterval) => void;
	setIsEventIntervalActive: (active: boolean) => void;
	setIsEventIntervalStartResizable: (resizable: boolean) => void;
	setIsEventIntervalEndResizable: (resizable: boolean) => void;
	incEventIntervalStart: (
		restrictInterval: CalInterval,
		minTimeSpan: number
	) => (minutes: number) => void;
	decEventIntervalStart: (
		restrictInterval: CalInterval,
		events: CalEvent[]
	) => (minutes: number) => void;
	incEventIntervalEnd: (
		restrictInterval: CalInterval,
		events: CalEvent[]
	) => (minutes: number) => void;
	decEventIntervalEnd: (
		restrictInterval: CalInterval,
		minTimeSpan: number
	) => (minutes: number) => void;
	updateEventIntervalStart: (
		minTimeSpan: number,
		events: CalEvent[]
	) => (update: (newDate: Date) => Date) => void;
	updateEventIntervalEnd: (
		minTimeSpan: number,
		events: CalEvent[]
	) => (update: (newDate: Date) => Date) => void;
}

export const createEventIntervalSlice: StateCreator<EventIntervalSlice> = (
	set
) => ({
	eventInterval: zeroInterval,
	isEventIntervalActive: false,
	isEventIntervalStartResizable: false,
	isEventIntervalEndResizable: false,
	setEventInterval(interval) {
		set({ eventInterval: interval });
	},
	updateEventInterval(update) {
		set((state) => ({ eventInterval: update(state.eventInterval) }));
	},
	setIsEventIntervalActive(active) {
		set({ isEventIntervalActive: active });
	},
	setIsEventIntervalStartResizable(isResizable) {
		set({ isEventIntervalStartResizable: isResizable });
	},
	setIsEventIntervalEndResizable(isResizable) {
		set({ isEventIntervalEndResizable: isResizable });
	},
	incEventIntervalStart(restrictInterval, minTimeSpan) {
		const check = checkConstraints(__, [
			constraints.ensureMinTimeSpan(minTimeSpan, false),
			constraints.withinInterval(restrictInterval, false),
		]);

		return function (minutes: number) {
			set((state) => {
				const [newEventInterval, checkFailed] = check(
					incStart(state.eventInterval, minutes)
				);
				if (checkFailed) {
					return {
						eventInterval: newEventInterval,
						isEventIntervalStartResizable: false,
					};
				}
				return { eventInterval: newEventInterval };
			});
		};
	},
	decEventIntervalStart(restrictInterval, events) {
		const check = checkConstraints(__, [
			constraints.withinInterval(restrictInterval, false),
			constraints.noEventOverlap(events, false),
		]);

		return function (minutes: number) {
			set((state) => {
				const [newEventInterval, checkFailed] = check(
					decStart(state.eventInterval, minutes)
				);
				if (checkFailed) {
					return {
						eventInterval: newEventInterval,
						isEventIntervalStartResizable: false,
					};
				}
				return { eventInterval: newEventInterval };
			});
		};
	},
	incEventIntervalEnd(restrictInterval, events) {
		const check = checkConstraints(__, [
			constraints.withinInterval(restrictInterval, true),
			constraints.noEventOverlap(events, true),
		]);

		return function (minutes: number) {
			set((state) => {
				const [newEventInterval, checkFailed] = check(
					incEnd(state.eventInterval, minutes)
				);
				if (checkFailed) {
					return {
						eventInterval: newEventInterval,
						isEventIntervalEndResizable: false,
					};
				}
				return { eventInterval: newEventInterval };
			});
		};
	},
	decEventIntervalEnd(restrictInterval, minTimeSpan) {
		const check = checkConstraints(__, [
			constraints.ensureMinTimeSpan(minTimeSpan, true),
			constraints.withinInterval(restrictInterval, true),
		]);

		return function (minutes: number) {
			set((state) => {
				const [newEventInterval, checkFailed] = check(
					decEnd(state.eventInterval, minutes)
				);
				if (checkFailed) {
					return {
						eventInterval: newEventInterval,
						isEventIntervalEndResizable: false,
					};
				}
				return { eventInterval: newEventInterval };
			});
		};
	},
	updateEventIntervalStart(minTimeSpan, events) {
		const check = checkConstraints(__, [
			constraints.ensureMinTimeSpan(minTimeSpan, false),
			constraints.noEventOverlap(events, false),
		]);

		return function (update: (newDate: Date) => Date) {
			set((state) => {
				const [newEventInterval] = check(
					updateStart(state.eventInterval, update)
				);
				return { eventInterval: newEventInterval };
			});
		};
	},
	updateEventIntervalEnd(minTimeSpan, events) {
		let check = checkConstraints(__, [
			constraints.ensureMinTimeSpan(minTimeSpan, true),
			constraints.noEventOverlap(events, true),
		]);

		return function (update: (newDate: Date) => Date) {
			set((state) => {
				const [newEventInterval] = check(
					updateEnd(state.eventInterval, update)
				);
				return { eventInterval: newEventInterval };
			});
		};
	},
});
