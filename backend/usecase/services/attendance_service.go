package services

import (
	"errors"
	"log"
	"time"

	model "github.com/techyoichiro/jobreco/backend/domain/models"
	"github.com/techyoichiro/jobreco/backend/domain/repositories"
	"gorm.io/gorm"
)

type AttendanceService struct {
	repo repositories.AttendanceRepository
}

func NewAttendanceService(repo repositories.AttendanceRepository) *AttendanceService {
	return &AttendanceService{repo: repo}
}

// 出勤
func (s *AttendanceService) ClockIn(employeeID uint, storeID uint) error {
	now := time.Now().In(time.FixedZone("Asia/Tokyo", 9*60*60))
	workDate := now.Format("2006-01-02")

	// その日のDailyWorkSummaryを検索
	summary, err := s.repo.FindDailyWorkSummary(employeeID, workDate)
	log.Printf("ここ: %v", err)
	if err != nil {
		log.Printf("ここ: %v", err)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// レコードが見つからない場合は新しく作成
			summary = &model.DailyWorkSummary{
				EmployeeID:     employeeID,
				WorkDate:       now,
				StartTime:      now,
				TotalWorkTime:  0,
				TotalBreakTime: 0,
			}
			if err := s.repo.CreateDailyWorkSummary(summary); err != nil {
				log.Printf("Failed to create DailyWorkSummary: %v", err)
				return err
			}

			// 新しく作成したレコードを再取得
			summary, err = s.repo.FindDailyWorkSummary(employeeID, workDate)
			log.Printf("Summary: %v", summary)
			if err != nil {
				log.Printf("Failed to retrieve created DailyWorkSummary: %v", err)
				return err
			}
		} else {
			// 他のエラーが発生した場合は返却
			log.Printf("Error finding DailyWorkSummary: %v", err)
			return err
		}
	}

	// 出勤のWorkSegmentを作成
	workSegment := model.WorkSegment{
		SummaryID:  summary.ID,
		EmployeeID: employeeID,
		StoreID:    storeID,
		StartTime:  now,
		StatusID:   1, // 出勤
	}

	if err := s.repo.CreateWorkSegment(&workSegment); err != nil {
		return err
	}

	return nil
}

// 退勤
func (s *AttendanceService) ClockOut(employeeID uint) error {
	now := time.Now().In(time.FixedZone("Asia/Tokyo", 9*60*60))
	workDate := now.Format("2006-01-02")

	workSegment, err := s.repo.FindLatestWorkSegment(employeeID)
	if err != nil {
		return err
	}
	if workSegment == nil {
		return gorm.ErrRecordNotFound
	}

	workSegment.EndTime = &now
	workSegment.StatusID = 3 // 退勤
	if err := s.repo.UpdateWorkSegment(workSegment); err != nil {
		return err
	}

	summary, err := s.repo.FindDailyWorkSummary(employeeID, workDate)
	if err != nil {
		return err
	}
	if summary == nil {
		return gorm.ErrRecordNotFound
	}

	breakRecords, err := s.repo.FindBreakRecords(summary.ID)
	if err != nil {
		return err
	}

	var totalBreakTime time.Duration
	for _, record := range breakRecords {
		if record.BreakEnd != nil {
			totalBreakTime += record.BreakEnd.Sub(record.BreakStart)
		}
	}

	workDuration := now.Sub(workSegment.StartTime)
	totalWorkTime := workDuration - totalBreakTime

	summary.TotalBreakTime += totalBreakTime.Seconds() / 3600 // hours
	summary.TotalWorkTime = totalWorkTime.Seconds() / 3600    // hours
	return s.repo.UpdateDailyWorkSummary(summary)
}

// 外出
func (s *AttendanceService) GoOut(employeeID uint) error {
	now := time.Now().In(time.FixedZone("Asia/Tokyo", 9*60*60))
	workDate := now.Format("2006-01-02")

	summary, err := s.repo.FindDailyWorkSummary(employeeID, workDate)
	if err != nil {
		return err
	}
	if summary == nil {
		return gorm.ErrRecordNotFound
	}

	workSegment, err := s.repo.FindLatestWorkSegment(employeeID)
	if err != nil {
		return err
	}
	if workSegment == nil {
		return gorm.ErrRecordNotFound
	}

	breakRecord := model.BreakRecord{
		SummaryID:  summary.ID,
		BreakStart: now,
	}
	if err := s.repo.CreateBreakRecord(&breakRecord); err != nil {
		return err
	}

	workSegment.StatusID = 2 // 外出
	return s.repo.UpdateWorkSegment(workSegment)
}

// 戻り
func (s *AttendanceService) Return(employeeID uint) error {
	now := time.Now().In(time.FixedZone("Asia/Tokyo", 9*60*60))

	workSegment, err := s.repo.FindWorkSegmentToReturn(employeeID)
	if err != nil {
		return err
	}
	if workSegment == nil {
		return gorm.ErrRecordNotFound
	}

	workSegment.StatusID = 1 // 出勤
	workSegment.EndTime = &now
	return s.repo.UpdateWorkSegment(workSegment)
}
