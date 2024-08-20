package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/techyoichiro/jobreco/backend/usecase/services"
)

type SummaryController struct {
	service *services.SummaryService
}

func NewSummaryController(service *services.SummaryService) *SummaryController {
	return &SummaryController{service: service}
}

// 返却用
type EmployeeResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// 全従業員のIDと名前を取得するハンドラー
func (sc *SummaryController) GetAllEmployee(c *gin.Context) {
	employees, err := sc.service.GetAllEmployee()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 必要なフィールドだけを抽出
	var employeeResponses []EmployeeResponse
	for _, employee := range employees {
		employeeResponses = append(employeeResponses, EmployeeResponse{
			ID:   employee.ID,
			Name: employee.Name,
		})
	}

	// JSONとして返却
	c.JSON(http.StatusOK, employeeResponses)
}

// GetSummaryByEmpID 指定した従業員IDの勤怠情報を取得するハンドラー
func (sc *SummaryController) GetSummary(c *gin.Context) {
	employeeIDStr := c.Param("employeeId")
	yearStr := c.Param("year")
	monthStr := c.Param("month")

	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	year, err := strconv.Atoi(yearStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid year format"})
		return
	}

	month, err := strconv.Atoi(monthStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid month format"})
		return
	}

	response, err := sc.service.GetSummary(uint(employeeID), year, month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
