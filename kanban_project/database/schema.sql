-- Create the database [cite: 20]
CREATE DATABASE IF NOT EXISTS kanban_db;
USE kanban_db;

-- 1. Users Table (Core Requirement) [cite: 4, 17]
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. Boards Table [cite: 7, 21-25]
CREATE TABLE IF NOT EXISTS boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Lists/Columns Table (To Do, In Progress, Done) [cite: 9, 31-42]
CREATE TABLE IF NOT EXISTS lists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    board_id INT,
    title VARCHAR(100) NOT NULL,
    position INT, -- To keep track of column order
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- 4. Tasks Table [cite: 10, 43-52]
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    list_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    position INT, -- To keep track of order within the list [cite: 51]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

-- Optional: Seed the database with default columns [cite: 13-16]
-- Replace '1' with your actual board_id after you create one
-- INSERT INTO lists (board_id, title, position) VALUES (1, 'To Do', 1), (1, 'In Progress', 2), (1, 'Done', 3);