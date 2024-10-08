package router

import (
	"api/internal/controller"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/spf13/viper"
)

type MiddlewareFunc func(h http.Handler) http.Handler

func Use(r http.Handler, middleware ...MiddlewareFunc) http.Handler {
	for i := range middleware {
		r = middleware[i](r)
	}
	return r
}

func New(controller *controller.Controller, config *viper.Viper) http.Handler {
	r := mux.NewRouter()

	corsMiddleware := handlers.CORS(
		handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"}),
	)

	logMiddleware := func(h http.Handler) http.Handler {
		return handlers.LoggingHandler(os.Stdout, h)
	}

	r.HandleFunc("/api/events", controller.GetEvents).Methods(http.MethodGet)
	r.HandleFunc("/api/events/day", controller.GetEventsByDay).
		Methods(http.MethodGet).
		Queries("date", "{date:.*}", "tz", "{tz:.*}")
	r.HandleFunc("/api/events/week", controller.GetEventsByWeek).
		Methods(http.MethodGet).
		Queries("year", "{year:.*}", "week", "{week:.*}", "tz", "{tz:.*}")
	r.HandleFunc("/api/events/month", controller.GetEventsByMonth).
		Methods(http.MethodGet).
		Queries("year", "{year:.*}", "month", "{month:.*}", "tz", "{tz:.*}")
	r.HandleFunc("/api/events", controller.CreateEvent).Methods(http.MethodPost)
	r.HandleFunc("/api/events/{uuid}", controller.GetEvent).Methods(http.MethodGet)
	r.HandleFunc("/api/events/{uuid}", controller.UpdateEvent).Methods(http.MethodPut)
	r.HandleFunc("/api/events/{uuid}", controller.DeleteEvent).Methods(http.MethodDelete)
	r.PathPrefix("/").Handler(http.FileServer(http.Dir(config.GetString("frontend.path"))))

	return Use(r, corsMiddleware, logMiddleware)
}
