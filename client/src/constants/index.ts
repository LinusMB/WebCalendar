export const INTVL_MIN_RESIZE_STEP = 10;

const REST_API = "http://localhost:5000/api";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const buildQueryString = (params: Record<string, string>) =>
    new URLSearchParams(params).toString();

/**
 * API Endpoints
 *
 * @param start The start date in RFC 3339 format
 * @param end The end date in RFC 3339 format
 * @param date The date in RFC 3339 format
 * @param year The year
 * @param week The week number (1-52)
 * @param month The month number (1-12)
 * @param tz The time zone identifier (e.g. Europe/Berlin)
 * @param isoDate The date in ISO format, i.e. YYYY-MM-DD
 */

export const api = {
    ROUTES: {
        GET_ALL: `${REST_API}/events`,
        GET_BY_DATE: (start: string, end: string) =>
            `${REST_API}/events?` + buildQueryString({ start, end }),
        GET_BY_MONTH: (year: number, month: number, tz: string = timezone) =>
            `${REST_API}/events/month?` +
            buildQueryString({
                year: year.toString(),
                month: month.toString(),
                tz,
            }),
        GET_BY_WEEK: (year: number, week: number, tz: string = timezone) =>
            `${REST_API}/events/week?` +
            buildQueryString({
                year: year.toString(),
                week: week.toString(),
                tz,
            }),
        GET_BY_DAY: (isoDate: string, tz: string = timezone) =>
            `${REST_API}/events/day?` + buildQueryString({ date: isoDate, tz }),
        GET_CLOSEST_PREVIOUS: (date: string) =>
            `${REST_API}/events/previous?` + buildQueryString({ date }),
        GET_CLOSEST_NEXT: (date: string) =>
            `${REST_API}/events/next?` + buildQueryString({ date }),
        GET: (uuid: string) => `${REST_API}/events/${uuid}`,
        CREATE: `${REST_API}/events`,
        UPDATE: (uuid: string) => `${REST_API}/events/${uuid}`,
        DELETE: (uuid: string) => `${REST_API}/events/${uuid}`,
    },
};
