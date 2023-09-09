import {
    incHour,
    incDay,
    incWeek,
    incMonth,
    decHour,
    decDay,
    decWeek,
    decMonth,
} from "../../services/dates";

describe("increments and decrements", () => {
    const dateBefore = new Date("2000-01-01T00:00:00.000Z");

    it("returns date one hour later", () => {
        const dateAfter = incHour(dateBefore);
        expect(dateAfter.toISOString()).toBe("2000-01-01T01:00:00.000Z");
    });

    it("returns date one day later", () => {
        const dateAfter = incDay(dateBefore);
        expect(dateAfter.toISOString()).toBe("2000-01-02T00:00:00.000Z");
    });

    it("returns date one week later", () => {
        const dateAfter = incWeek(dateBefore);
        expect(dateAfter.toISOString()).toBe("2000-01-08T00:00:00.000Z");
    });

    it("returns date one month later", () => {
        const dateAfter = incMonth(dateBefore);
        expect(dateAfter.toISOString()).toBe("2000-02-01T00:00:00.000Z");
    });

    it("returns date one hour earlier", () => {
        const dateAfter = decHour(dateBefore);
        expect(dateAfter.toISOString()).toBe("1999-12-31T23:00:00.000Z");
    });

    it("returns date one day earlier", () => {
        const dateAfter = decDay(dateBefore);
        expect(dateAfter.toISOString()).toBe("1999-12-31T00:00:00.000Z");
    });

    it("returns date one week earlier", () => {
        const dateAfter = decWeek(dateBefore);
        expect(dateAfter.toISOString()).toBe("1999-12-25T00:00:00.000Z");
    });

    it("returns date one month earlier", () => {
        const dateAfter = decMonth(dateBefore);
        expect(dateAfter.toISOString()).toBe("1999-12-01T00:00:00.000Z");
    });
});
