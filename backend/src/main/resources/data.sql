SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE project_team_users;
TRUNCATE TABLE project_team;
TRUNCATE TABLE project;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Sample Data for User Entity (Table: users)
-- Note: Passwords are 'password123' hashed with BCrypt ($2a$10$...)
--password123
INSERT INTO users (employee_id, first_name, last_name, email, password, phone_number, role, is_active) VALUES
(101, 'John', 'Doe', 'john.doe@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543210, 'ADMIN', true),
(102, 'Jane', 'Smith', 'jane.smith@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543211, 'PROJECT_MANAGER', true),
(103, 'Robert', 'Brown', 'robert.brown@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543212, 'PROJECT_MANAGER', true),
(104, 'Emily', 'Davis', 'emily.davis@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543213, 'DEVELOPER', true),
(105, 'Michael', 'Wilson', 'michael.wilson@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543214, 'DEVELOPER', true),
(106, 'Sarah', 'Miller', 'sarah.miller@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543215, 'DEVELOPER', true),
(107, 'David', 'Garcia', 'david.garcia@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543216, 'DEVELOPER', true),
(108, 'Jessica', 'Taylor', 'jessica.taylor@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543217, 'DEVELOPER', true),
(109, 'Kevin', 'Anderson', 'kevin.anderson@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543218, 'DEVELOPER', false),
(110, 'Laura', 'Thomas', 'laura.thomas@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876543219, 'PROJECT_MANAGER', true);
-- Sample Data for Project Entity (Table: project)
-- Assuming manager_id references the auto-generated user_id from the users table

INSERT INTO project (project_name, project_status, domain, manager_id) VALUES
('Global Banking System', 'IN_PROGRESS', 'BANKING', 3),
('HealthTrack Pro', 'IN_PROGRESS', 'HEALTHCARE', 2),
('Retail Inventory Optimizer', 'COMPLETED', 'RETAIL', 2),
('Claims Processing Engine', 'IN_PROGRESS', 'INSURANCE', 3),
('Smart Learning Platform', 'IN_PROGRESS', 'EDUCATION', 3),
('GovConnect Portal', 'COMPLETED', 'GOVERNMENT', 2),
('Legacy Tech Migration', 'IN_PROGRESS', 'TECHNOLOGY', 8),
('Smart Factory Dashboard', 'IN_PROGRESS', 'MANUFACTURING', 8),
('Customer Loyalty App', 'COMPLETED', 'RETAIL', 10),
('Internal Security Tool', 'IN_PROGRESS', 'TECHNOLOGY', 10);

-- Sample Data for Sprint Entity (Table: sprint)
-- Matches your Enum names and Java Date types
INSERT INTO sprint (sprint_name, start_date, end_date, status, project_id) VALUES
('Sprint 1 - Foundation', '2026-04-01', '2026-04-14', 'COMPLETED', 1),
('Sprint 2 - API Dev', '2026-04-15', '2026-04-28', 'ACTIVE', 1),
('Sprint 1 - Discovery', '2026-04-05', '2026-04-18', 'COMPLETED', 2),
('Sprint 2 - UI Prototype', '2026-04-19', '2026-05-02', 'PLANNED', 2),
('Sprint 1 - Final Review', '2026-03-01', '2026-03-15', 'COMPLETED', 4),
('Sprint 1 - Core Engine', '2026-04-10', '2026-04-24', 'PLANNED', 1),
('Sprint 1 - Beta Launch', '2026-03-20', '2026-04-03', 'COMPLETED', 6),
('Sprint 1 - Migration Prep', '2026-04-12', '2026-04-26', 'ACTIVE', 1),
('Sprint 3 - Deployment', '2026-03-10', '2026-03-24', 'COMPLETED', 9),
('Sprint 1 - Planning', '2026-04-25', '2026-05-08', 'PLANNED', 10);

INSERT INTO project_team (project_id) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10);


INSERT INTO project_team_users (team_id, user_id) VALUES
-- Team 1 (Project Alpha) has Users 4, 5, and 7
(1, 4), (1, 5), (1, 7),
-- Team 2 (Project Beta) has Users 5 and 6
(2, 6), (2, 8), (2,9),
-- Team 3 (Project Gamma) has Users 4, 8, and 10
(3, 4), (3, 8), (3, 9),
-- Team 4 (Project Delta) has Users 6 and 7
(4, 6), (4, 7), (4,4),
-- Team 5 (Project Epsilon) has Users 5, 8, and 9
(5, 5), (5, 8), (5, 9),
-- Team 6 (Project Zeta) has Users 4 and 10
(6, 4), (6, 8), (6,9),
-- Team 7 (Project Eta) has Users 7 and 8
(7, 7), (7, 8), (7,9),
-- Team 8 (Project Theta) has Users 5 and 10
(8, 5), (8, 6), (8,8),
-- Team 9 (Project Iota) has Users 4, 6, and 9
(9, 4), (9, 6), (9, 7),
-- Team 10 (Project Kappa) has Users 7 and 10
(10, 4), (10, 5), (10,7)