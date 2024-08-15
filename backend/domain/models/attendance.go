package model

import (
	"time"

	"gorm.io/gorm"
)

type Attendance struct {
	gorm.Model
	SummaryID  int       `gorm:"not null"`
	EmployeeID int       `gorm:"not null"`
	StoreID    int       `gorm:"not null"`
	StartTime  time.Time `gorm:"not null"`
	EndTime    time.Time `gorm:"not null"`
	StatusID   int       `gorm:"not null"`
}
