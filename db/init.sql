DROP DATABASE IF EXISTS jobreco_db;
CREATE DATABASE jobreco_db;
USE jobreco_db;

-- 従業員テーブル（変更なし）
CREATE TABLE employees (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    login_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT UNSIGNED NOT NULL DEFAULT 1,
    hourly_pay INT NOT NULL DEFAULT 1112,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 権限（ロール）テーブル（変更なし）
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 店舗テーブル（変更なし）
CREATE TABLE stores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
); 
-- 日次勤怠サマリーテーブル
CREATE TABLE daily_work_summaries (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id INT UNSIGNED NOT NULL,
    work_date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    total_work_time DECIMAL(4, 2) NOT NULL DEFAULT 0, -- 総勤務時間（分）
    total_break_time DECIMAL(4, 2) NOT NULL DEFAULT 0, -- 総休憩時間（分）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_daily_summary (employee_id, work_date)
);

-- 勤務セグメントテーブル
CREATE TABLE work_segments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    summary_id INT UNSIGNED NOT NULL,
    employee_id INT UNSIGNED NOT NULL,
    store_id INT UNSIGNED NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (summary_id) REFERENCES daily_work_summaries(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- 休憩記録テーブル
CREATE TABLE break_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    summary_id INT UNSIGNED NOT NULL,
    break_start TIMESTAMP NOT NULL,
    break_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (summary_id) REFERENCES daily_work_summaries(id)
);

-- 初期投入データ
INSERT INTO stores (store_name) VALUES
('我家'),
('Ate');

INSERT INTO roles (role_name) VALUES
('管理者'),
('一般');
