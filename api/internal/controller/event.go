package controller

import (
	"api/internal/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func (c *Controller) GetAllEvents(w http.ResponseWriter, r *http.Request) {
	evts, err := c.storage.Event.GetAll()
	_ = evts
	if err != nil {
		writeMsg(w, http.StatusInternalServerError, "message", "data access failure")
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
