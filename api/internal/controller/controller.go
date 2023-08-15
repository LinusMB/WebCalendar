package controller

import (
	"api/internal/storage"
	"encoding/json"
	"net/http"

	"github.com/spf13/viper"
)

type Controller struct {
	storage *storage.Storage
	config  *viper.Viper
}

func New(storage *storage.Storage, config *viper.Viper) *Controller {
	return &Controller{
		storage: storage,
		config:  config,
	}
}

func writeJSON(w http.ResponseWriter, statusCode int, data any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	return json.NewEncoder(w).Encode(data)
}

func writeMsg(w http.ResponseWriter, statusCode int, key string, value any) error {
	return writeJSON(w, statusCode, map[string]any{
		key: value,
	})
}
