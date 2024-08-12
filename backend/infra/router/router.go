package router

import (
	"github.com/gin-gonic/gin"
	controller "github.com/techyoichiro/jobreco/backend/interface/controllers"
)

func SetupRouter(authController *controller.AuthController) *gin.Engine {
	router := gin.Default()

	// router.GET("/", authController.GetTop)
	// router.GET("/signup", authController.GetSignup)
	router.POST("/signup", authController.PostSignup)
	// router.GET("/login", authController.GetLogin)
	router.POST("/login", authController.PostLogin)

	return router
}
