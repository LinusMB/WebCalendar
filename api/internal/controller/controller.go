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

func writeKV(w http.ResponseWriter, statusCode int, key string, value any) error {
	return writeJSON(w, statusCode, map[string]any{
		key: value,
	})
}

func writeKVs(w http.ResponseWriter, statusCode int, kvPairs ...any) error {
	m := map[string]any{}
	for i := range kvPairs {
		if i%2 == 0 {
			m[kvPairs[i].(string)] = kvPairs[i+1]
		}
	}

	return writeJSON(w, statusCode, m)
}
