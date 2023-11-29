package controller

import (
	"api/internal/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

func (c *Controller) GetAllEvents(w http.ResponseWriter, r *http.Request) {
	evts, err := c.storage.Event.GetAll()
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEvents(w http.ResponseWriter, r *http.Request) {
	vars := r.URL.Query()

	var (
		startDate time.Time
		endDate   time.Time
		sortField models.EventField
		sortOrder models.SortOrder
		limit     int
	)
	{
		if vars.Has("start") {
			startVar := vars.Get("start")
			start, err := time.Parse(time.RFC3339, startVar)
			if err != nil {
				writeKV(w, http.StatusBadRequest, "message", err.Error())
				return
			}
			startDate = start.UTC()
		}
	}
	{
		if vars.Has("end") {
			endVar := vars.Get("end")
			end, err := time.Parse(time.RFC3339, endVar)
			if err != nil {
				writeKV(w, http.StatusBadRequest, "message", err.Error())
				return
			}
			endDate = end.UTC()
		}
	}
	{
		if vars.Has("limit") {
			limitVar := vars.Get("limit")
			var err error
			limit, err = strconv.Atoi(limitVar)
			if err != nil {
				writeKV(w, http.StatusBadRequest, "message", err.Error())
				return
			}
		}
	}
	{
		if vars.Has("sort") {
			sortFieldVar := vars.Get("sort")
			switch sortFieldVar {
			case "id":
				sortField = models.ID
			case "uuid":
				sortField = models.UUID
			case "title":
				sortField = models.Title
			case "description":
				sortField = models.Description
			case "date_from":
				sortField = models.DateFrom
			case "date_to":
				sortField = models.DateTo
			case "created_at":
				sortField = models.CreatedAt
			default:
				writeKV(w, http.StatusBadRequest, "message", fmt.Sprintf("query paramter sort=%s not supported", sortFieldVar))
				return
			}

			sortOrderVar := vars.Get("ord")
			switch sortOrderVar {
			case "asc", "":
				sortOrder = models.Asc
			case "desc":
				sortOrder = models.Desc
			default:
				writeKV(w, http.StatusBadRequest, "message", fmt.Sprintf("query paramter order=%s not supported", sortOrderVar))
				return
			}
		}
	}

	evts, err := c.storage.Event.GetByFilter(startDate, endDate, sortField, sortOrder, limit)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByDay(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	location, err := time.LoadLocation(vars["tz"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	startDate, err := time.ParseInLocation(time.DateOnly, vars["date"], location)
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	startDateUTC := startDate.UTC()
	endDateUTC := startDateUTC.AddDate(0, 0, 1)
	evts, err := c.storage.Event.GetByFilter(startDateUTC, endDateUTC, models.DateFrom, models.Asc, 0)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByWeek(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	location, err := time.LoadLocation(vars["tz"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	year, err := strconv.Atoi(vars["year"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	week, err := strconv.Atoi(vars["week"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	t := time.Date(year, 1, 1, 0, 0, 0, 0, location)

	for {
		y, w := t.ISOWeek()
		if y == year && w == 1 {
			break
		}
		t = t.AddDate(0, 0, 1)
	}
	startDateUTC := t.Add(time.Duration(week-1) * 7 * 24 * time.Hour).UTC()
	endDateUTC := startDateUTC.AddDate(0, 0, 7)
	evts, err := c.storage.Event.GetByFilter(startDateUTC, endDateUTC, models.DateFrom, models.Asc, 0)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByMonth(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	location, err := time.LoadLocation(vars["tz"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	year, err := strconv.Atoi(vars["year"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	month, err := strconv.Atoi(vars["month"])
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	startDateUTC := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, location).UTC()
	endDateUTC := startDateUTC.AddDate(0, 1, 0)
	evts, err := c.storage.Event.GetByFilter(startDateUTC, endDateUTC, models.DateFrom, models.Asc, 0)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var evt models.Event
	err := json.NewDecoder(r.Body).Decode(&evt)
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		fmt.Fprint(os.Stderr, err)
		return
	}
	evt.DateFrom = evt.DateFrom.UTC()
	evt.DateTo = evt.DateTo.UTC()
	uuid, err := c.storage.Event.Create(&evt)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return
	}
	writeKV(w, http.StatusOK, "uuid", uuid)
}

func (c *Controller) GetEvent(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	evt, err := c.storage.Event.GetByUUID(uuid)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			writeKV(w, http.StatusNotFound, "message", "does not exist")
		default:
			writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		}
		fmt.Fprint(os.Stderr, err)
		return
	}
	writeJSON(w, http.StatusOK, evt)
}

func (c *Controller) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	var evt models.Event
	err := json.NewDecoder(r.Body).Decode(&evt)
	if err != nil {
		writeKV(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	evt.DateFrom = evt.DateFrom.UTC()
	evt.DateTo = evt.DateTo.UTC()
	evt.UUID = uuid
	err = c.storage.Event.Update(&evt)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return
	}
	writeKV(w, http.StatusOK, "message", "success")
}

func (c *Controller) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	err := c.storage.Event.Delete(uuid)
	if err != nil {
		writeKV(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return
	}
	writeKV(w, http.StatusOK, "message", "success")
}
