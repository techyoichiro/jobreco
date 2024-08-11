package repository

import (
	"context"

	"github.com/techyoichiro/jobreco/backend/domain/models"
	"github.com/techyoichiro/jobreco/backend/domain/repositories"
	"gorm.io/gorm"
)

// GORMによるTodoリポジトリの実装
type AuthRepository struct {
	DB *gorm.DB
}

// NewAuthRepository
func NewAuthRepository(db *gorm.DB) repositories.AuthRepository {
	return &AuthRepository{DB: db}
}

// 以下、インターフェースの各メソッドの実装
func (r *AuthRepository) GetByID(ctx context.Context, id uint) (*models.Employee, error) {
	var employee models.Employee
	result := r.DB.First(&employee, id)
	return &employee, result.Error
}

func (r *AuthRepository) Create(ctx context.Context, employee *models.Employee) error {
	return r.DB.Create(employee).Error
}

func (r *AuthRepository) Update(ctx context.Context, employee *models.Employee) error {
	return r.DB.WithContext(ctx).Save(employee).Error
}

func (r *AuthRepository) Delete(ctx context.Context, id uint) error {
	return r.DB.Delete(&models.Employee{}, id).Error
}

func (r *AuthRepository) List(ctx context.Context) ([]*models.Employee, error) {
	var employees []*models.Employee
	result := r.DB.Find(&employees)
	return employees, result.Error
}
