package postgres

import (
	"api/internal/models"
	"database/sql"
	"testing"
	"time"

	_ "github.com/lib/pq"
	"github.com/stretchr/testify/assert"
)

func TestGetAll(t *testing.T) {
	reloadTestDatabase()

	events, err := ea.GetAll()

	assert.NoError(t, err)
	assert.NotEmpty(t, events)
}

func TestGetByDate(t *testing.T) {
	reloadTestDatabase()

	t.Run("Contains 2", func(t *testing.T) {
		events, err := ea.GetByDate(
			time.Date(2022, time.February, 1, 0, 0, 0, 0, time.UTC),
			time.Date(2022, time.February, 28, 0, 0, 0, 0, time.UTC),
		)
		assert.NoError(t, err)
		assert.Len(t, events, 2)
	})

	t.Run("Contains 2", func(t *testing.T) {
		events, err := ea.GetByDate(
			time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC),
			time.Date(2022, time.January, 3, 0, 0, 0, 0, time.UTC),
		)
		assert.NoError(t, err)
		assert.Len(t, events, 2)
	})

	t.Run("Contains None", func(t *testing.T) {
		events, err := ea.GetByDate(
			time.Date(2022, time.December, 1, 0, 0, 0, 0, time.UTC),
			time.Date(2022, time.December, 31, 0, 0, 0, 0, time.UTC),
		)
		assert.NoError(t, err)
		assert.Empty(t, events)
	})
}

func TestCreate(t *testing.T) {
	reloadTestDatabase()

	evtBefore := &models.Event{
		Title:       "New Event Title",
		Description: "New Event Description",
		DateFrom:    time.Date(2022, time.January, 1, 0, 0, 0, 0, time.UTC),
		DateTo:      time.Date(2022, time.January, 2, 0, 0, 0, 0, time.UTC),
	}

	uuid, err := ea.Create(evtBefore)
	assert.NoError(t, err)

	evtAfter, err := ea.GetByUUID(uuid)
	assert.NoError(t, err)
	assert.NotZero(t, evtAfter)
	assert.Equal(t, evtBefore.Title, evtAfter.Title)
	assert.Equal(t, evtBefore.Description, evtAfter.Description)
	assert.True(t, evtBefore.DateFrom.Equal(evtAfter.DateFrom))
	assert.True(t, evtBefore.DateTo.Equal(evtAfter.DateTo))
}

func TestGetByUUID(t *testing.T) {
	reloadTestDatabase()

	t.Run("Event Found", func(t *testing.T) {
		uuid := "AA"
		evt, err := ea.GetByUUID(uuid)
		assert.NoError(t, err)
		assert.Equal(t, evt.UUID, uuid)
	})

	t.Run("Event not Found", func(t *testing.T) {
		uuid := "_"
		_, err := ea.GetByUUID(uuid)
		assert.Equal(t, err, sql.ErrNoRows)
	})
}

func TestUpdate(t *testing.T) {
	reloadTestDatabase()

	uuid := "AA"
	evt := &models.Event{
		Title:       "New Event Title",
		Description: "New Event Description",
		DateFrom:    time.Date(2022, time.January, 3, 0, 0, 0, 0, time.UTC),
		DateTo:      time.Date(2022, time.January, 4, 0, 0, 0, 0, time.UTC),
		UUID:        uuid,
	}

	evtBefore, err := ea.GetByUUID(uuid)
	assert.NoError(t, err)
	assert.NotZero(t, evtBefore)

	assert.NotEqual(t, evt.Title, evtBefore.Title)
	assert.NotEqual(t, evt.Description, evtBefore.Description)
	assert.False(t, evt.DateFrom.Equal(evtBefore.DateFrom))
	assert.False(t, evt.DateTo.Equal(evtBefore.DateTo))

	err = ea.Update(evt)
	assert.NoError(t, err)

	evtAfter, err := ea.GetByUUID(uuid)
	assert.Equal(t, evt.Title, evtAfter.Title)
	assert.Equal(t, evt.Description, evtAfter.Description)
	assert.True(t, evt.DateFrom.Equal(evtAfter.DateFrom))
	assert.True(t, evt.DateTo.Equal(evtAfter.DateTo))
}

func TestDelete(t *testing.T) {
	reloadTestDatabase()

	uuid := "AA"
	evt, err := ea.GetByUUID(uuid)
	assert.NoError(t, err)
	assert.NotZero(t, evt)

	err = ea.Delete(uuid)
	assert.NoError(t, err)

	_, err = ea.GetByUUID(uuid)
	assert.Equal(t, err, sql.ErrNoRows)
}
