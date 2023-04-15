package storage

import (
	"api/internal/models"
	"api/internal/storage/postgres"
	"database/sql"
)

type Storage struct {
	Event models.EventAccess
}

func New(db *sql.DB) *Storage {
	return &Storage{
		Event: postgres.NewEventAccess(db),
	}
}
