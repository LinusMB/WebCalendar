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

type EventAccess interface {
	GetAll() ([]Event, error)
	GetByDate(start, end time.Time) ([]Event, error)
	Create(evt *Event) (string, error)
	GetByUUID(uuid string) (*Event, error)
	Update(evt *Event) error
	Delete(uuid string) error
}
