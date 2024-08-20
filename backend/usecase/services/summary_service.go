package services

import (
	"strconv"
	"strings"
	"time"

	model "github.com/techyoichiro/jobreco/backend/domain/models"
	"github.com/techyoichiro/jobreco/backend/domain/repositories"
)

type SummaryService struct {
	repo repositories.SummaryRepository
}

type BreakRecordResponse struct {
	ID         uint       `json:"ID"`
	BreakStart time.Time  `json:"BreakStart"`
	BreakEnd   *time.Time `json:"BreakEnd"`
}

type SummaryResponse struct {
	WorkDate      time.Time             `json:"WorkDate"`
	StartTime     time.Time             `json:"StartTime"`
	EndTime       *time.Time            `json:"EndTime"`
	TotalWorkTime float64               `json:"TotalWorkTime"`
	BreakRecords  []BreakRecordResponse `json:"BreakRecords"`
	Overtime      float64               `json:"Overtime"`
	Remarks       string                `json:"Remarks"`
	HourlyPay     int                   `json:"HourlyPay"`
}

func NewSummaryService(repo repositories.SummaryRepository) *SummaryService {
	return &SummaryService{repo: repo}
}

// GetAllEmployee 全従業員の名前を取得するサービス
func (s *SummaryService) GetAllEmployee() ([]model.Employee, error) {
	return s.repo.GetAllEmployee()
}

// GetSummaryByEmpID 指定した従業員IDの勤怠情報を取得するサービス
func (s *SummaryService) GetSummary(employeeID uint, year int, month int) ([]SummaryResponse, error) {
	// リポジトリからデータを取得
	summaries, err := s.repo.GetSummary(employeeID, year, month)
	if err != nil {
		return nil, err
	}

	// 時給を取得
	hourlyPay, err := s.repo.GetHourlyPay(employeeID)
	if err != nil {
		return nil, err
	}

	// データ変換と整形
	response := []SummaryResponse{}
	for _, summary := range summaries {
		var breakRecords []BreakRecordResponse
		for _, breakRecord := range summary.BreakRecords {
			breakRecords = append(breakRecords, BreakRecordResponse{
				ID:         breakRecord.ID,
				BreakStart: breakRecord.BreakStart,
				BreakEnd:   breakRecord.BreakEnd,
			})
		}

		response = append(response, SummaryResponse{
			WorkDate:      summary.WorkDate,
			StartTime:     summary.StartTime,
			EndTime:       summary.EndTime,
			TotalWorkTime: summary.TotalWorkTime,
			BreakRecords:  breakRecords,
			Overtime:      calculateOvertime(summary),
			Remarks:       generateRemarks(summary),
			HourlyPay:     hourlyPay,
		})
	}

	return response, nil
}

func calculateOvertime(summary model.DailyWorkSummary) float64 {
	var overtime float64

	// 勤務開始時間と終了時間を取得
	startTime := summary.StartTime
	endTime := summary.EndTime

	// 勤務時間がある場合、時間外労働を計算
	if !startTime.IsZero() && endTime != nil {
		// 勤務時間を計算
		workDuration := endTime.Sub(startTime).Hours()

		// 22:00を超える部分を時間外労働として計算
		if endTime.Hour() > 22 {
			threshold := 22.0
			// 勤務終了時間が22:00を超える場合の計算
			overTimeStart := float64(startTime.Hour()) + float64(startTime.Minute())/60.0
			overtime = workDuration - (threshold - overTimeStart)

			// 15分刻みに丸める（切り下げ）
			overtime = float64(int(overtime*4)) / 4.0
		}

	}

	return overtime
}

func generateRemarks(summary model.DailyWorkSummary) string {
	var remarks []string

	// 勤務セグメントがある場合、備考欄を生成
	for _, segment := range summary.WorkSegments {
		// 時間をフォーマットし、StoreID を string 型に変換
		startTime := segment.StartTime.Format("15:04")
		endTime := "-"
		if segment.EndTime != nil {
			endTime = segment.EndTime.Format("15:04")
		}
		storeID := strconv.FormatUint(uint64(segment.StoreID), 10)

		// フォーマットした文字列を作成
		segmentRemark := startTime + "-" + endTime + " " + storeID
		remarks = append(remarks, segmentRemark)
	}

	// 備考欄をカンマで連結
	return strings.Join(remarks, ", ")
}
