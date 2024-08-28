A Calendar Web Application, using Go for the backend and Typescript+React for the frontend.

This is a WIP and mostly an exercise on my part in writing reactive SPAs.

## Getting Started

### Backend

Start the server

```sh
$ cd api
$ docker-compose up -d
$ go run cmd/server/main.go
$ bash scripts/api/prime.sh  # (optional) prime the db with examples
```

### Frontend

Compile to JS 

```sh
$ cd client
$ npm install
$ npm build
# or start dev server...
$ npm run dev
```

## Demo

Quick demo showing create, delete and update operations

https://github.com/user-attachments/assets/aee3a390-fb18-4256-bce4-502237858ae8
