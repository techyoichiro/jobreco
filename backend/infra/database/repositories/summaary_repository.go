package repository

import (
	model "github.com/techyoichiro/jobreco/backend/domain/models"
	"gorm.io/gorm"
)

type SummaryRepositoryImpl struct {
	DB *gorm.DB
}

func NewSummaryRepository(db *gorm.DB) *SummaryRepositoryImpl {
	return &SummaryRepositoryImpl{DB: db}
}

// GetAllEmployee 全従業員の名前を取得するリポジトリメソッド
func (r *SummaryRepositoryImpl) GetAllEmployee() ([]model.Employee, error) {
	var employees []model.Employee
	if err := r.DB.Select("id, name").Find(&employees).Error; err != nil {
		return nil, err
	}
	return employees, nil
}

// GetSummaryByEmpID 指定した従業員IDの勤怠情報を取得するリポジトリメソッド
func (r *SummaryRepositoryImpl) GetSummary(employeeID uint, year int, month int) ([]model.DailyWorkSummary, error) {
	var summaries []model.DailyWorkSummary
	err := r.DB.Where("employee_id = ? AND EXTRACT(YEAR FROM work_date) = ? AND EXTRACT(MONTH FROM work_date) = ?", employeeID, year, month).Find(&summaries).Error
	if err != nil {
		return nil, err
	}
	return summaries, nil
}
