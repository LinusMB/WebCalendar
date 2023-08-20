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
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByDate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	start, err := time.Parse(time.RFC3339, vars["start"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	end, err := time.Parse(time.RFC3339, vars["end"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	evts, err := c.storage.Event.GetByDate(start, end)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByDay(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	location, err := time.LoadLocation(vars["tz"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	start, err := time.ParseInLocation(time.DateOnly, vars["date"], location)
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	startUTC := start.UTC()
	endUTC := startUTC.AddDate(0, 0, 1)
	evts, err := c.storage.Event.GetByDate(startUTC, endUTC)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByWeek(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	location, err := time.LoadLocation(vars["tz"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	year, err := strconv.Atoi(vars["year"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	week, err := strconv.Atoi(vars["week"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	t := time.Date(year, 1, 1, 0, 0, 0, 0, location)
	for t.Weekday() != time.Monday {
		t = t.AddDate(0, 0, 1)
	}
	startUTC := t.Add(time.Duration(week-1) * 7 * 24 * time.Hour).UTC()
	endUTC := startUTC.AddDate(0, 0, 7)
	evts, err := c.storage.Event.GetByDate(startUTC, endUTC)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) GetEventsByMonth(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	location, err := time.LoadLocation(vars["tz"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	year, err := strconv.Atoi(vars["year"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	month, err := strconv.Atoi(vars["month"])
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	startUTC := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, location).UTC()
	endUTC := startUTC.AddDate(0, 1, 0)
	evts, err := c.storage.Event.GetByDate(startUTC, endUTC)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		return
	}
	writeJSON(w, http.StatusOK, evts)
}

func (c *Controller) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var evt models.Event
	err := json.NewDecoder(r.Body).Decode(&evt)
	if err != nil {
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		fmt.Fprint(os.Stderr, err)
		return
	}
	uuid, err := c.storage.Event.Create(&evt)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return
	}
	writeMsg(w, http.StatusOK, "uuid", uuid)
}

func (c *Controller) GetEvent(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	evt, err := c.storage.Event.GetByUUID(uuid)
	if err != nil {
		switch err {
		case sql.ErrNoRows:
			writeMsg(w, http.StatusNotFound, "message", "does not exist")
		default:
			writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
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
		writeMsg(w, http.StatusBadRequest, "message", err.Error())
		return
	}
	evt.UUID = uuid
	err = c.storage.Event.Update(&evt)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return
	}
}

func (c *Controller) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	uuid := mux.Vars(r)["uuid"]
	err := c.storage.Event.Delete(uuid)
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
		fmt.Fprint(os.Stderr, err)
		return

	}
}
