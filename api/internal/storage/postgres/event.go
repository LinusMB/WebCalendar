package postgres

import (
	"api/internal/models"
	"database/sql"
	"fmt"
	"strings"
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

func (ea *eventAccess) GetByFilter(startDate, endDate time.Time, sortField models.EventField, sortOrder models.SortOrder, limit int) ([]models.Event, error) {
	var (
		evts      []models.Event
		queryArgs []any
	)

	var sortFieldName string
	switch sortField {
	case models.ID:
		sortFieldName = "id"
	case models.UUID:
		sortFieldName = "uuid"
	case models.Title:
		sortFieldName = "title"
	case models.Description:
		sortFieldName = "description"
	case models.DateFrom:
		sortFieldName = "date_from"
	case models.DateTo:
		sortFieldName = "date_to"
	case models.CreatedAt:
		sortFieldName = "created_at"
	default:
		return evts, fmt.Errorf("sortField %v not supported", sortField)
	}

	var sortOrderName string
	switch sortOrder {
	case models.Asc:
		sortOrderName = "ASC"
	case models.Desc:
		sortOrderName = "DESC"
	default:
		return evts, fmt.Errorf("sortOrder %v not supported", sortOrder)
	}

	var b strings.Builder

	b.WriteString("SELECT id, uuid, title, description, date_from, date_to, created_at")
	b.WriteString("\nFROM events")

	if !startDate.IsZero() && !endDate.IsZero() {
		b.WriteString("\nWHERE ($1, $2) OVERLAPS (date_from, date_to)")
		queryArgs = append(queryArgs, startDate, endDate)
	} else if !startDate.IsZero() {
		b.WriteString("\nWHERE date_to > $1")
		queryArgs = append(queryArgs, startDate)
	} else if !endDate.IsZero() {
		b.WriteString("\nWHERE date_from < $1")
		queryArgs = append(queryArgs, endDate)
	}
	b.WriteString(fmt.Sprintf("\nORDER BY %s %s", sortFieldName, sortOrderName))

	if limit != 0 {
		b.WriteString(fmt.Sprintf("\nLIMIT %d", limit))
	}

	b.WriteString(";")
	query := b.String()

	rows, err := ea.db.Query(query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
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
	query := `
SELECT id, uuid, title, description, date_from, date_to, created_at
FROM events
WHERE uuid = $1;`
	var evt models.Event
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
