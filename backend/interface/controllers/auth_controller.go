package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/techyoichiro/jobreco/backend/usecase/services"
)

type AuthController struct {
	service *services.AuthService
}

func NewAuthController(service *services.AuthService) *AuthController {
	return &AuthController{
		service: service,
	}
}

func (ac *AuthController) PostSignup(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		LoginID  string `json:"login_id"`
		Password string `json:"password"`
	}

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	employee, err := ac.service.Signup(req.Name, req.LoginID, req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"employee": employee})
}

func (ac *AuthController) PostLogin(c *gin.Context) {
	var request struct {
		ID       string `json:"id"`
		Password string `json:"password"`
	}
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// 巡業員に紐づくlogin_idを取得
	LoginID, err := ac.service.GetLoginIDByEmpID(request.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve login_id"})
		return
	}

	// ログイン処理
	emp, err := ac.service.Login(LoginID, request.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// ログインユーザーに紐づく status_id を取得
	statusID, err := ac.service.GetStatusByEmpID(emp.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve status_id"})
		return
	}

	// ユーザー情報と status_id を返す
	c.JSON(http.StatusOK, gin.H{
		"employee": gin.H{
			"ID":     emp.ID,
			"Name":   emp.Name,
			"RoleID": emp.RoleID,
		},
		"status_id": statusID,
	})
}
