package repository

import (
	model "github.com/techyoichiro/jobreco/backend/domain/models"
	"gorm.io/gorm"
)

type EmployeeRepositoryImpl struct {
	DB *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepositoryImpl {
	return &EmployeeRepositoryImpl{DB: db}
}

func (r *EmployeeRepositoryImpl) FindByLoginID(loginID string) (*model.Employee, error) {
	var employee model.Employee
	if err := r.DB.Where("login_id = ?", loginID).First(&employee).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &employee, nil
}

func (r *EmployeeRepositoryImpl) Create(employee *model.Employee) error {
	return r.DB.Create(employee).Error
}
