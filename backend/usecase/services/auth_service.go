package services

import (
	"errors"
	"log"

	"github.com/techyoichiro/jobreco/backend/crypto"
	model "github.com/techyoichiro/jobreco/backend/domain/models"
	"github.com/techyoichiro/jobreco/backend/domain/repositories"
)

type AuthService struct {
	repo repositories.EmployeeRepository
}

func NewAuthService(repo repositories.EmployeeRepository) *AuthService {
	return &AuthService{repo: repo}
}

// サインアップ
func (s *AuthService) Signup(name, loginID, password string) (*model.Employee, error) {
	existingEmployee, err := s.repo.FindByLoginID(loginID)
	if err != nil {
		log.Printf("Error finding employee by loginID: %v", err)
		return nil, err
	}
	if existingEmployee != nil {
		log.Printf("Employee already exists: %v", existingEmployee)
		return nil, errors.New("同一の従業員IDが既に登録されています")
	}

	encryptedPw, err := crypto.PasswordEncrypt(password)
	if err != nil {
		log.Printf("Error encrypting password: %v", err)
		return nil, err
	}

	employee := &model.Employee{
		Name:      name,
		LoginID:   loginID,
		Password:  encryptedPw,
		RoleID:    1,
		HourlyPay: 1112,
	}

	err = s.repo.Create(employee)
	if err != nil {
		log.Printf("Error creating employee: %v", err)
		return nil, err
	}

	return employee, nil
}

// ログイン
func (s *AuthService) Login(loginID, password string) (*model.Employee, error) {
	emp, err := s.repo.FindByLoginID(loginID)
	if err != nil {
		return nil, err
	}
	if emp == nil {
		return nil, errors.New("ログインIDが一致するユーザーが存在しません。")
	}

	err = crypto.CompareHashAndPassword(emp.Password, password)
	if err != nil {
		return nil, errors.New("パスワードが一致しませんでした。")
	}

	return emp, nil
}
