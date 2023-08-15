package main

import (
	"api/internal/config"
	"api/internal/controller"
	"api/internal/router"
	"api/internal/storage"
	"database/sql"
	"fmt"
	"log"
	"net/http"

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
	dsn := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		config.GetString("postgres.host"),
		config.GetInt("postgres.port"),
		config.GetString("postgres.user"),
		config.GetString("postgres.password"),
		config.GetString("postgres.dbname"),
	)
	db, err := sql.Open("postgres", dsn)
	failIf(err, "open database connection")
	storage := storage.New(db)
	controller := controller.New(storage, config)
	router := router.New(controller, config)
	addr := fmt.Sprintf("%s:%s", config.GetString("server.host"), config.GetString("server.port"))
	fmt.Printf("listening on %s\n", addr)
	http.ListenAndServe(addr, router)
}
