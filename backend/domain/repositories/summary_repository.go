package repositories

import (
	model "github.com/techyoichiro/jobreco/backend/domain/models"
)

type SummaryRepository interface {
	GetAllEmployee() ([]model.Employee, error)
	GetSummary(uint, int, int) ([]model.DailyWorkSummary, error)
	GetWorkSegments(uint) []model.WorkSegment
	GetHourlyPay(uint) (int, error)
}
