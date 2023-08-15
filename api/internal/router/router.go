package router

import (
	"api/internal/controller"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/spf13/viper"
)

func New(controller *controller.Controller, config *viper.Viper) http.Handler {
	r := mux.NewRouter()

	r.HandleFunc("/api/events", controller.GetEventsByDate).Methods(http.MethodGet).Queries("start", "{start:.*}", "end", "{end:.*}")
	r.HandleFunc("/api/events", controller.GetAllEvents).Methods(http.MethodGet)
	r.HandleFunc("/api/events", controller.CreateEvent).Methods(http.MethodPost)
	r.HandleFunc("/api/events/{uuid}", controller.GetEvent).Methods(http.MethodGet)
	r.HandleFunc("/api/events/{uuid}", controller.UpdateEvent).Methods(http.MethodPut)
	r.HandleFunc("/api/events/{uuid}", controller.DeleteEvent).Methods(http.MethodDelete)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(config.GetString("frontend.path"))))

	return r
}
