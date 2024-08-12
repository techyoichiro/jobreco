package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/techyoichiro/jobreco/backend/infra/database"
	repository "github.com/techyoichiro/jobreco/backend/infra/database/repositories"
	"github.com/techyoichiro/jobreco/backend/infra/router"
	controller "github.com/techyoichiro/jobreco/backend/interface/controllers"
	"github.com/techyoichiro/jobreco/backend/usecase/services"
)

func main() {
	// データベース接続の設定
	db, err := database.ConnectionDB()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// リポジトリの初期化
	empRepo := repository.NewEmployeeRepository(db)

	// サービス層の初期化
	authService := services.NewAuthService(empRepo)

	// コントローラの初期化
	authController := controller.NewAuthController(authService)

	engine := gin.Default()

	// CORSミドルウェアの設定
	engine.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:3000"}, // NextアプリのURLを指定
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// ルータの設定
	engine = router.SetupRouter(authController)
	// engine = router.SetupRouterPage(engine, todoController)

	// サーバを8080ポートで起動
	if err := engine.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
