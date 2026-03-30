
INSERT INTO project ( project_name)
VALUES ('ProjectSphere Alpha');


INSERT INTO user ( employee_id,first_name, last_name, email, phone_number, system_role, is_active)
VALUES ( 101,'John', 'Reporter', 'john@cts.com', 9876543210, 'PROJECT_MANAGER', true);

INSERT INTO user ( employee_id,first_name, last_name, email, phone_number, system_role, is_active)
VALUES ( 102,'Alice', 'Assignee', 'alice@cts.com', 9123456780, 'TEAM_MEMBER', true);

INSERT INTO sprint (sprint_name)
VALUES ('Sprint 01: Core API');

-- Reset the counter to start AFTER your manual IDs
--ALTER TABLE user AUTO_INCREMENT = 3;
--ALTER TABLE sprint AUTO_INCREMENT = 11;