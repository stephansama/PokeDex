CREATE TABLE IF NOT EXISTS `users` (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NAME VARCHAR(255) NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL,
)