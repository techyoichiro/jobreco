package services

import (
	model "github.com/techyoichiro/jobreco/backend/domain/models"
	"github.com/techyoichiro/jobreco/backend/domain/repositories"
)

type SummaryService struct {
	repo repositories.SummaryRepository
}

func NewSummaryService(repo repositories.SummaryRepository) *SummaryService {
	return &SummaryService{repo: repo}
}

// GetAllEmployee 全従業員の名前を取得するサービス
func (s *SummaryService) GetAllEmployee() ([]model.Employee, error) {
	return s.repo.GetAllEmployee()
}

// GetSummaryByEmpID 指定した従業員IDの勤怠情報を取得するサービス
func (s *SummaryService) GetSummary(employeeID uint, year int, month int) ([]model.DailyWorkSummary, error) {
	return s.repo.GetSummary(employeeID, year, month)
}
