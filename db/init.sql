DROP DATABASE IF EXISTS jobreco_db;
CREATE DATABASE jobreco_db;
USE jobreco_db;

-- 従業員テーブル（変更なし）
CREATE TABLE employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    login_id VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    hourly_pay INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 権限（ロール）テーブル（変更なし）
CREATE TABLE role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 店舗テーブル（変更なし）
CREATE TABLE store (
    store_id INT AUTO_INCREMENT PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 
-- 日次勤怠サマリーテーブル（新規）
CREATE TABLE daily_work_summarie (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    work_date DATE NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME ,
    total_work_time DECIMAL(4, 2) NOT NULL DEFAULT 0, -- 総勤務時間（分）
    total_break_time DECIMAL(4, 2) NOT NULL DEFAULT 0, -- 総休憩時間（分）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee(employee_id),
    UNIQUE KEY unique_daily_summary (employee_id, work_date)
);

-- 勤務セグメントテーブル（新規）
CREATE TABLE work_segment (
    segment_id INT AUTO_INCREMENT PRIMARY KEY,
    summary_id INT NOT NULL,
    store_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (summary_id) REFERENCES daily_work_summarie(summary_id),
    FOREIGN KEY (store_id) REFERENCES store(store_id)
);

-- 休憩記録テーブル
CREATE TABLE break_record (
    break_id INT AUTO_INCREMENT PRIMARY KEY,
    summary_id INT NOT NULL,
    break_start DATETIME NOT NULL,
    break_end DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (summary_id) REFERENCES daily_work_summarie(summary_id)
);

-- 初期投入データ
INSERT INTO store (store_name) VALUES
('Ate'),
('我家');

INSERT INTO role (role_name) VALUES
('管理者'),
('一般');

INSERT INTO employee (name, login_id, password, role_id, hourly_pay) VALUES
('籾井洋一郎', 'user1', 'pass', 1, 1150),
('矢澤一晟', 'user2', 'pass', 2, 1150);
