package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	model "github.com/techyoichiro/jobreco/backend/domain/models"
)

func getTop(c *gin.Context) {
	c.HTML(http.StatusOK, "home.html", nil)
}

func getSignup(c *gin.Context) {
	c.HTML(http.StatusOK, "signup.html", nil)
}

func postSignup(c *gin.Context) {
	id := c.PostForm("employee_id")
	pw := c.PostForm("password")
	employee, err := model.Signup(id, pw)
	if err != nil {
		c.Redirect(301, "/signup")
		return
	}
	c.HTML(http.StatusOK, "home.html", gin.H{"employee": employee})
}

func getLogin(c *gin.Context) {
	c.HTML(http.StatusOK, "login.html", nil)
}

func postLogin(c *gin.Context) {
	id := c.PostForm("employee_id")
	pw := c.PostForm("password")

	employee, err := model.Login(id, pw)
	if err != nil {
		c.Redirect(301, "/login")
		return
	}
	c.HTML(http.StatusOK, "top.html", gin.H{"employee": employee})
}
