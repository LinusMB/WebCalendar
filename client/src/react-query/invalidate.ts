import { CalInterval } from "../types";
import { format, getWeekSpec, getMonthSpec } from "../services/dates";
import { queryClient, queryKeys } from ".";
import { useStore } from "../store";
import { getPreviousEvents, getNextEvents } from "../hooks/events";

export function invalidateEventsOnDay(d: Date) {
    const isoDate = format(d, "yyyy-MM-dd");
    const queryKey = queryKeys.events.getByDay(isoDate);
    queryClient.invalidateQueries(queryKey);
}

export function invalidateEventsOnWeek(d: Date) {
    const [year, week] = getWeekSpec(d);
    const queryKey = queryKeys.events.getByWeek(year, week);
    queryClient.invalidateQueries(queryKey);
}

export function invalidateEventsOnMonth(d: Date) {
    const [year, month] = getMonthSpec(d);
    const queryKey = queryKeys.events.getByMonth(year, month);
    queryClient.invalidateQueries(queryKey);
}

export async function refetchPreviousEvents() {
    const evtIntvl = useStore.getState().evtIntvl;
    const previousEvents = await getPreviousEvents(evtIntvl);
    return queryClient.setQueryData(
        queryKeys.events.getPrevious(),
        previousEvents
    );
}

export async function refetchNextEvents() {
    const evtIntvl = useStore.getState().evtIntvl;
    const nextEvents = await getNextEvents(evtIntvl);
    return queryClient.setQueryData(queryKeys.events.getNext(), nextEvents);
}

export function invalidateOnEventChange(evtIntvl: CalInterval) {
    invalidateEventsOnDay(evtIntvl.start);
    invalidateEventsOnWeek(evtIntvl.start);
    invalidateEventsOnMonth(evtIntvl.start);

    invalidateEventsOnDay(evtIntvl.end);
    invalidateEventsOnWeek(evtIntvl.end);
    invalidateEventsOnMonth(evtIntvl.end);

    refetchPreviousEvents();
    refetchNextEvents();
}
