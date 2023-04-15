package postgres

import (
	"api/internal/models"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type eventAccess struct {
	db *sql.DB
}

func NewEventAccess(db *sql.DB) *eventAccess {
	return &eventAccess{
		db: db,
	}
}

func (ea *eventAccess) GetAll() ([]models.Event, error) {
	query := `SELECT id, uuid, title, description, date_from, date_to, created_at FROM events;`
	rows, err := ea.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var evts []models.Event
	for rows.Next() {
		var evt models.Event
		err = rows.Scan(&evt.ID, &evt.UUID, &evt.Title, &evt.Description, &evt.DateFrom, &evt.DateTo, &evt.CreatedAt)
		if err != nil {
			return nil, err
		}
		evts = append(evts, evt)
	}
	return evts, nil
}

func (ea *eventAccess) GetByDate(start, end time.Time) ([]models.Event, error) {
	query := `
SELECT id, uuid, title, description, date_from, date_to, created_at
FROM events
WHERE date_from >= $1 AND date_to <= $2;`
	rows, err := ea.db.Query(query, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var evts []models.Event
	for rows.Next() {
		var evt models.Event
		err = rows.Scan(&evt.ID, &evt.UUID, &evt.Title, &evt.Description, &evt.DateFrom, &evt.DateTo, &evt.CreatedAt)
		if err != nil {
			return nil, err
		}
		evts = append(evts, evt)
	}
	return evts, nil
}

func (ea *eventAccess) Create(evt *models.Event) (string, error) {
	query := `
INSERT INTO events (uuid, title, description, date_from, date_to)
VALUES ($1, $2, $3, $4, $5)
RETURNING uuid;`
	uuid := uuid.New().String()
	_, err := ea.db.Exec(query, uuid, evt.Title, evt.Description, evt.DateFrom, evt.DateTo)
	return uuid, err
}

func (ea *eventAccess) GetByUUID(uuid string) (*models.Event, error) {
	var evt models.Event
	query := `
SELECT id, uuid, title, description, date_from, date_to, created_at
FROM events
WHERE uuid = $1;`
	err := ea.db.QueryRow(query, uuid).
		Scan(&evt.ID, &evt.UUID, &evt.Title, &evt.Description, &evt.DateFrom, &evt.DateTo, &evt.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &evt, nil
}

func (ea *eventAccess) Update(evt *models.Event) error {
	query := `
UPDATE events
SET title = $1,
description = $2,
date_from = $3,
date_to = $4
WHERE uuid = $5;`
	_, err := ea.db.Exec(query, evt.Title, evt.Description, evt.DateFrom, evt.DateTo, evt.UUID)
	return err
}

func (ea *eventAccess) Delete(uuid string) error {
	query := `
DELETE FROM events
WHERE uuid = $1;`
	_, err := ea.db.Exec(query, uuid)
	return err
}
