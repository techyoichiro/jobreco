package repositories

import (
	model "github.com/techyoichiro/jobreco/backend/domain/models"
)

// EmployeeRepository
type EmployeeRepository interface {
	FindByLoginID(loginID string) (*model.Employee, error)
	Create(employee *model.Employee) error
}
