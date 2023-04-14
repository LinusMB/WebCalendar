package main

import (
	"api/internal/config"
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func failIf(err error, msg string) {
	if err != nil {
		log.Fatalf("error: %s: %v", msg, err)
	}
}

func main() {
	config, err := config.New()
	failIf(err, "parse configuration")
	host := "localhost"
	port := 5432
	user := "postgres"
	password := "password"
	dbname := "calendar"
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	db, err := sql.Open("postgres", dsn)
	err = db.Ping()
	if err != nil {
		panic(err)
	}
}
