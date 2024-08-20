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

// 全従業員の名前を取得するリポジトリメソッド
func (r *SummaryRepositoryImpl) GetAllEmployee() ([]model.Employee, error) {
	var employees []model.Employee
	if err := r.DB.Select("id, name").Find(&employees).Error; err != nil {
		return nil, err
	}
	return employees, nil
}

// GetSummary
func (r *SummaryRepositoryImpl) GetSummary(employeeID uint, year int, month int) ([]model.DailyWorkSummary, error) {
	var summaries []model.DailyWorkSummary

	// PreloadでBreakRecordsとWorkSegmentsをロード
	err := r.DB.Preload("BreakRecords").
		Preload("WorkSegments"). // WorkSegmentsもロード
		Where("employee_id = ? AND EXTRACT(YEAR FROM work_date) = ? AND EXTRACT(MONTH FROM work_date) = ?", employeeID, year, month).
		Find(&summaries).Error
	if err != nil {
		return nil, err
	}

	// 店舗IDとそのセグメントをマップで取得
	workSegmentMap := make(map[uint][]model.WorkSegment)
	var workSegments []model.WorkSegment
	err = r.DB.Where("employee_id = ? AND EXTRACT(YEAR FROM start_time) = ? AND EXTRACT(MONTH FROM start_time) = ?", employeeID, year, month).
		Find(&workSegments).Error
	if err != nil {
		return nil, err
	}

	// WorkSegmentsをマップに追加
	for _, segment := range workSegments {
		if _, exists := workSegmentMap[segment.SummaryID]; !exists {
			workSegmentMap[segment.SummaryID] = []model.WorkSegment{}
		}
		workSegmentMap[segment.SummaryID] = append(workSegmentMap[segment.SummaryID], segment)
	}

	// DailyWorkSummaryにWorkSegmentsを割り当て
	for i := range summaries {
		if segments, exists := workSegmentMap[summaries[i].ID]; exists {
			summaries[i].WorkSegments = segments
		}
	}

	return summaries, nil
}

// GetWorkSegments 指定した勤怠記録のセグメントを取得するリポジトリメソッド
func (r *SummaryRepositoryImpl) GetWorkSegments(summaryID uint) []model.WorkSegment {
	var segments []model.WorkSegment
	r.DB.Where("summary_id = ?", summaryID).Find(&segments)
	return segments
}

// 従業員IDから時給を取得する
func (r *SummaryRepositoryImpl) GetHourlyPay(employeeID uint) (int, error) {
	var employee model.Employee
	if err := r.DB.Where("id = ?", employeeID).First(&employee).Error; err != nil {
		return 0, err
	}
	return employee.HourlyPay, nil
}
