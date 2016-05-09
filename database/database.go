package database

import (
	"database/sql"

	_ "github.com/lib/pq" // to initialize postgres
)

func ConnectDatabase(dsn string) *sql.DB {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		panic(err)
	}

	return db
}
