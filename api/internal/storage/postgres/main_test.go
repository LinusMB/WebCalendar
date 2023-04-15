package postgres

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"testing"

	"github.com/go-testfixtures/testfixtures/v3"
)

var (
	ea       *eventAccess
	fixtures *testfixtures.Loader
)

var (
	dsn = fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		"localhost",
		5432,
		"postgres",
		"password",
		"calendar_test",
	)
	driver = "postgres"
)

func TestMain(m *testing.M) {
	db, err := sql.Open(driver, dsn)
	if err != nil {
		log.Fatalf("cannot connect to db: %v", err)
	}

	fixtures, err = testfixtures.New(
		testfixtures.Database(db),
		testfixtures.Dialect("postgres"),
		testfixtures.Directory("../../../test/fixtures"),
	)
	if err != nil {
		log.Fatalf("cannot create testfixtures: %v", err)
	}
	ea = NewEventAccess(db)
	code := m.Run()
	os.Exit(code)
}

func reloadTestDatabase() {
	if err := fixtures.Load(); err != nil {
		log.Fatalf("cannot load fixtures: %v", err)
	}
}
