package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/techyoichiro/jobreco/backend/infra/database"
	repository "github.com/techyoichiro/jobreco/backend/infra/database/repositories"
	"github.com/techyoichiro/jobreco/backend/infra/router"
	controller "github.com/techyoichiro/jobreco/backend/interface/controllers"
	"github.com/techyoichiro/jobreco/backend/usecase/services"
)

func initialize() (*gin.Engine, *controller.AuthController, *controller.AttendanceController) {
	// データベース接続の設定
	db, err := database.ConnectionDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// リポジトリの初期化
	empRepo := repository.NewEmployeeRepository(db)
	attendanceRepo := repository.NewAttendanceRepository(db)

	// サービス層の初期化
	authService := services.NewAuthService(empRepo)
	attendanceService := services.NewAttendanceService(attendanceRepo)

	// コントローラの初期化
	authController := controller.NewAuthController(authService)
	attendanceController := controller.NewAttendanceController(attendanceService)

	// ルータの設定
	engine := router.SetupRouter(authController, attendanceController)
	return engine, authController, attendanceController
}

func main() {
	engine, _, _ := initialize()

	// サーバを8080ポートで起動
	if err := engine.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
