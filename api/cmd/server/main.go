package main

import (
	"api/internal/config"
	"fmt"
	"log"
)

func failIf(err error, msg string) {
	if err != nil {
		log.Fatalf("error: %s: %v", msg, err)
	}
}

func main() {
	config, err := config.New()
	failIf(err, "parse configuration")
	fmt.Println(config.GetString("frontend.path"), config.GetString("server.port"))
}
