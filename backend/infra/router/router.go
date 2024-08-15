package router

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	controller "github.com/techyoichiro/jobreco/backend/interface/controllers"
)

func SetupRouter(authController *controller.AuthController) *gin.Engine {
	router := gin.Default()

	// CORS設定を手動で追加
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	// OPTIONSメソッドの処理を追加
	router.OPTIONS("/auth/login", func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Status(200)
	})

	// router.GET("/", authController.GetTop)
	router.POST("/auth/signup", authController.PostSignup)
	// router.GET("/auth/login", authController.GetLogin)
	router.POST("/auth/login", authController.PostLogin)

	return router
}
