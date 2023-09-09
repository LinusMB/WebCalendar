export const INTERVAL_MIN_RESIZE_STEP = 10;

const REST_API = "http://localhost:5000/api";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const buildQueryString = (params: Record<string, string>) =>
    new URLSearchParams(params).toString();

type EventField =
    | "id"
    | "uuid"
    | "title"
    | "description"
    | "date_from"
    | "date_to"
    | "created_at";

type SortOrder = "asc" | "desc";

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
        GET_BY_FILTER: (filterOptions: {
            start?: string;
            end?: string;
            sort?: EventField;
            ord?: SortOrder;
            limit?: number;
        }) => {
            const params: Record<string, string> = {};
            if (filterOptions.start != null) params.start = filterOptions.start;
            if (filterOptions.end != null) params.end = filterOptions.end;
            if (filterOptions.sort != null) params.sort = filterOptions.sort;
            if (filterOptions.ord != null) params.ord = filterOptions.ord;
            if (filterOptions.limit != null)
                params.limit = filterOptions.limit.toString();

            return `${REST_API}/events?` + buildQueryString(params);
        },
        GET: (uuid: string) => `${REST_API}/events/${uuid}`,
        CREATE: `${REST_API}/events`,
        UPDATE: (uuid: string) => `${REST_API}/events/${uuid}`,
        DELETE: (uuid: string) => `${REST_API}/events/${uuid}`,
    },
};
