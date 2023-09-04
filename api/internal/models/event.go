package models

import "time"

type Event struct {
	ID          int       `json:"id"`
	UUID        string    `json:"uuid"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DateFrom    time.Time `json:"date_from"`
	DateTo      time.Time `json:"date_to"`
	CreatedAt   time.Time `json:"created_at"`
}

type EventField int

//go:generate stringer -type EventField

const (
	ID EventField = iota
	UUID
	Title
	Description
	DateFrom
	DateTo
	CreatedAt
)

type SortOrder int

//go:generate stringer -type SortOrder

const (
	Asc SortOrder = iota
	Desc
)

type EventAccess interface {
	GetAll() ([]Event, error)
	GetByFilter(
		startDate, endDate time.Time,
		sortField EventField,
		sortOrder SortOrder,
		limit int,
	) ([]Event, error)
	Create(evt *Event) (string, error)
	GetByUUID(uuid string) (*Event, error)
	Update(evt *Event) error
	Delete(uuid string) error
}
