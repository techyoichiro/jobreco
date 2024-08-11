package model

import (
	"errors"
	"fmt"

	"github.com/techyoichiro/jobreco/backend/crypto"

	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	EmployeeId string
	Password   string
}

func init() {
	Db.Set("gorm:table_options", "ENGINE = InnoDB").AutoMigrate(Employee{})
}

func (e *Employee) LoggedIn() bool {
	return e.ID != 0
}

func Signup(employeeId, password string) (*Employee, error) {
	employee := Employee{}
	Db.Where("employee_id = ?", employeeId).First(&employee)
	if employee.ID != 0 {
		err := errors.New("同一名の従業員IDが既に登録されています。")
		fmt.Println(err)
		return nil, err
	}

	encryptPw, err := crypto.PasswordEncrypt(password)
	if err != nil {
		fmt.Println("パスワード暗号化中にエラーが発生しました。：", err)
		return nil, err
	}
	employee = Employee{EmployeeId: employeeId, Password: encryptPw}
	Db.Create(&employee)
	return &employee, nil
}

func Login(employeeId, password string) (*Employee, error) {
	employee := Employee{}
	Db.Where("employee_id = ?", employeeId).First(&employee)
	if employee.ID == 0 {
		err := errors.New("従業員IDが一致するユーザーが存在しません。")
		fmt.Println(err)
		return nil, err
	}

	err := crypto.CompareHashAndPassword(employee.Password, password)
	if err != nil {
		fmt.Println("パスワードが一致しませんでした。：", err)
		return nil, err
	}

	return &employee, nil
}
