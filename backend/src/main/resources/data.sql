-- ═══════════════════════════════════════════════════════════════════════
--  ProjectSphere — development seed data
--  15+ rows per table, all FKs satisfied, business rules respected:
--    • 1 team per project
--    • each developer belongs to at most 1 team
--    • scrum_master_id points to a member of that same team
--    • created_at uses NOW() so dashboards show "recent" activity
--  Password hash below is a placeholder BCrypt for 'password123'.
-- ═══════════════════════════════════════════════════════════════════════

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE ticket_history;
TRUNCATE TABLE attachment;
TRUNCATE TABLE comment;
TRUNCATE TABLE defect_steps_to_reproduce;
TRUNCATE TABLE defect;
TRUNCATE TABLE textcase_userstory;
TRUNCATE TABLE test_case;
TRUNCATE TABLE ticket;
TRUNCATE TABLE sprint;
TRUNCATE TABLE project_team_users;
TRUNCATE TABLE project_team;
TRUNCATE TABLE project;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;


-- ═══════════════════════════════════════════════════════════════════════
--  USERS  (1 admin, 5 PMs, 34 developers → 40 rows)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO users (employee_id, first_name, last_name, email, password, phone_number, role, is_active) VALUES
-- Admin
(1001, 'Arjun',    'Mehra',     'arjun.mehra@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500001, 'ADMIN',           true),
-- Project Managers
(2001, 'Priya',    'Sharma',    'priya.sharma@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500002, 'PROJECT_MANAGER', true),
(2002, 'Rahul',    'Kapoor',    'rahul.kapoor@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500003, 'PROJECT_MANAGER', true),
(2003, 'Neha',     'Gupta',     'neha.gupta@cts.com',      '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500004, 'PROJECT_MANAGER', true),
(2004, 'Vikram',   'Singh',     'vikram.singh@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500005, 'PROJECT_MANAGER', true),
(2005, 'Ananya',   'Iyer',      'ananya.iyer@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500006, 'PROJECT_MANAGER', true),
-- Developers 7..36 — each will be placed in exactly one team below
(3001, 'Kiran',    'Patel',     'kiran.patel@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500007, 'DEVELOPER',       true),
(3002, 'Nisha',    'Rao',       'nisha.rao@cts.com',       '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500008, 'DEVELOPER',       true),
(3003, 'Dev',      'Joshi',     'dev.joshi@cts.com',       '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500009, 'DEVELOPER',       true),
(3004, 'Meera',    'Reddy',     'meera.reddy@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500010, 'DEVELOPER',       true),
(3005, 'Aarav',    'Verma',     'aarav.verma@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500011, 'DEVELOPER',       true),
(3006, 'Ishani',   'Bose',      'ishani.bose@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500012, 'DEVELOPER',       true),
(3007, 'Rohan',    'Desai',     'rohan.desai@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500013, 'DEVELOPER',       true),
(3008, 'Sneha',    'Nair',      'sneha.nair@cts.com',      '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500014, 'DEVELOPER',       true),
(3009, 'Karthik',  'Menon',     'karthik.menon@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500015, 'DEVELOPER',       true),
(3010, 'Tanvi',    'Shah',      'tanvi.shah@cts.com',      '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500016, 'DEVELOPER',       true),
(3011, 'Varun',    'Agarwal',   'varun.agarwal@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500017, 'DEVELOPER',       true),
(3012, 'Pooja',    'Pillai',    'pooja.pillai@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500018, 'DEVELOPER',       true),
(3013, 'Ramesh',   'Kumar',     'ramesh.kumar@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500019, 'DEVELOPER',       true),
(3014, 'Divya',    'Kapoor',    'divya.kapoor@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500020, 'DEVELOPER',       true),
(3015, 'Manish',   'Chandra',   'manish.chandra@cts.com',  '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500021, 'DEVELOPER',       true),
(3016, 'Shruti',   'Ghosh',     'shruti.ghosh@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500022, 'DEVELOPER',       true),
(3017, 'Nikhil',   'Banerjee',  'nikhil.banerjee@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500023, 'DEVELOPER',       true),
(3018, 'Kavya',    'Malhotra',  'kavya.malhotra@cts.com',  '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500024, 'DEVELOPER',       true),
(3019, 'Pranav',   'Saxena',    'pranav.saxena@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500025, 'DEVELOPER',       true),
(3020, 'Riya',     'Choudhury', 'riya.choudhury@cts.com',  '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500026, 'DEVELOPER',       true),
(3021, 'Siddharth','Raj',       'siddharth.raj@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500027, 'DEVELOPER',       true),
(3022, 'Anjali',   'Trivedi',   'anjali.trivedi@cts.com',  '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500028, 'DEVELOPER',       true),
(3023, 'Harsh',    'Singhania', 'harsh.singhania@cts.com', '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500029, 'DEVELOPER',       true),
(3024, 'Megha',    'Vora',      'megha.vora@cts.com',      '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500030, 'DEVELOPER',       true),
(3025, 'Aditya',   'Thakur',    'aditya.thakur@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500031, 'DEVELOPER',       true),
(3026, 'Lavanya',  'Das',       'lavanya.das@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500032, 'DEVELOPER',       true),
(3027, 'Saurabh',  'Mishra',    'saurabh.mishra@cts.com',  '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500033, 'DEVELOPER',       true),
(3028, 'Ritika',   'Bhatt',     'ritika.bhatt@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500034, 'DEVELOPER',       true),
(3029, 'Tushar',   'Chauhan',   'tushar.chauhan@cts.com',  '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500035, 'DEVELOPER',       true),
(3030, 'Payal',    'Mathur',    'payal.mathur@cts.com',    '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500036, 'DEVELOPER',       true),
-- Unassigned developers 37..40 (not in any team yet)
(3031, 'Amit',     'Khanna',    'amit.khanna@cts.com',     '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500037, 'DEVELOPER',       true),
(3032, 'Swati',    'Jain',      'swati.jain@cts.com',      '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500038, 'DEVELOPER',       true),
(3033, 'Gaurav',   'Bhatia',    'gaurav.bhatia@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500039, 'DEVELOPER',       false),
(3034, 'Shalini',  'Anand',     'shalini.anand@cts.com',   '$2a$10$8.UnS8zQX9uSShutnY3Q6Ou0ssA6Y.mD.Z46lS8bSxS.XG.XG.XG.', 9876500040, 'DEVELOPER',       true);


-- ═══════════════════════════════════════════════════════════════════════
--  PROJECTS (15) — managers rotated across PMs 2..6
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO project (project_name, product_description, project_status, domain, manager_id, created_at, completed_at) VALUES
('Global Banking System',      'Core-banking revamp with UPI and ISO 20022',                   'IN_PROGRESS', 'BANKING',       2, NOW() - INTERVAL 120 DAY, NULL),
('HealthTrack Pro',            'Next-gen patient engagement and EHR integration',              'IN_PROGRESS', 'HEALTHCARE',    2, NOW() - INTERVAL 95 DAY,  NULL),
('Retail Inventory Optimizer', 'ML-driven inventory forecasting for omni-channel retail',      'COMPLETED',   'RETAIL',        2, NOW() - INTERVAL 210 DAY, NOW() - INTERVAL 35 DAY),
('Claims Processing Engine',   'Straight-through claims pipeline for auto insurance',          'IN_PROGRESS', 'INSURANCE',     3, NOW() - INTERVAL 80 DAY,  NULL),
('Smart Learning Platform',    'Live-class scheduling and adaptive assessments for K-12',      'IN_PROGRESS', 'EDUCATION',     3, NOW() - INTERVAL 70 DAY,  NULL),
('GovConnect Portal',          'Citizen services aggregation portal',                          'COMPLETED',   'GOVERNMENT',    3, NOW() - INTERVAL 260 DAY, NOW() - INTERVAL 60 DAY),
('Legacy Tech Migration',      'Mainframe to microservices rewrite',                           'IN_PROGRESS', 'TECHNOLOGY',    4, NOW() - INTERVAL 150 DAY, NULL),
('Smart Factory Dashboard',    'Real-time production and OEE dashboards',                      'COMPLETED',   'MANUFACTURING', 4, NOW() - INTERVAL 240 DAY, NOW() - INTERVAL 20 DAY),
('Customer Loyalty App',       'Omni-channel rewards and gamification',                        'IN_PROGRESS', 'RETAIL',        4, NOW() - INTERVAL 60 DAY,  NULL),
('Internal Security Tool',     'SSO, MFA, and audit logging for internal tools',               'IN_PROGRESS', 'TECHNOLOGY',    5, NOW() - INTERVAL 45 DAY,  NULL),
('Patient Records Vault',      'HIPAA-compliant long-term archival of patient records',        'COMPLETED',   'HEALTHCARE',    5, NOW() - INTERVAL 300 DAY, NOW() - INTERVAL 50 DAY),
('Digital Onboarding Suite',   'Paperless KYC and e-sign for retail banking',                  'IN_PROGRESS', 'BANKING',       5, NOW() - INTERVAL 55 DAY,  NULL),
('Fraud Detection System',     'Real-time ML scoring of claim transactions',                   'IN_PROGRESS', 'INSURANCE',     6, NOW() - INTERVAL 40 DAY,  NULL),
('Logistics Tracker',          'Fleet telematics and route optimizer for last-mile delivery',  'COMPLETED',   'MANUFACTURING', 6, NOW() - INTERVAL 220 DAY, NOW() - INTERVAL 10 DAY),
('Campus Recruitment Portal',  'Requisition, interview-scheduling and offer workflow',         'IN_PROGRESS', 'EDUCATION',     6, NOW() - INTERVAL 30 DAY,  NULL);


-- ═══════════════════════════════════════════════════════════════════════
--  SPRINTS (30 — two per project, ids follow 2n-1, 2n pattern)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO sprint (sprint_name, start_date, end_date, status, project_id) VALUES
('Sprint 1 · Foundation',           '2026-02-01', '2026-02-14', 'COMPLETED', 1),
('Sprint 2 · API Development',      '2026-02-15', '2026-02-28', 'ACTIVE',    1),
('Sprint 1 · Discovery',            '2026-02-05', '2026-02-18', 'COMPLETED', 2),
('Sprint 2 · UI Prototype',         '2026-02-19', '2026-03-04', 'ACTIVE',    2),
('Sprint 1 · Final Build',          '2025-12-01', '2025-12-14', 'COMPLETED', 3),
('Sprint 2 · Release Prep',         '2025-12-15', '2025-12-28', 'COMPLETED', 3),
('Sprint 1 · Core Engine',          '2026-02-10', '2026-02-24', 'ACTIVE',    4),
('Sprint 2 · Reporting',            '2026-02-25', '2026-03-10', 'PLANNED',   4),
('Sprint 1 · Course Catalog',       '2026-02-12', '2026-02-26', 'COMPLETED', 5),
('Sprint 2 · Live Classes',         '2026-02-27', '2026-03-12', 'ACTIVE',    5),
('Sprint 1 · Beta Launch',          '2025-10-01', '2025-10-14', 'COMPLETED', 6),
('Sprint 2 · Hardening',            '2025-10-15', '2025-10-28', 'COMPLETED', 6),
('Sprint 1 · Migration Prep',       '2026-02-08', '2026-02-22', 'ACTIVE',    7),
('Sprint 2 · Data Cutover',         '2026-02-23', '2026-03-08', 'PLANNED',   7),
('Sprint 1 · IoT Intake',           '2025-11-15', '2025-11-28', 'COMPLETED', 8),
('Sprint 2 · Analytics',            '2025-11-29', '2025-12-12', 'COMPLETED', 8),
('Sprint 1 · Rewards Engine',       '2026-02-20', '2026-03-05', 'ACTIVE',    9),
('Sprint 2 · Mobile UX',            '2026-03-06', '2026-03-19', 'PLANNED',   9),
('Sprint 1 · SSO Integration',      '2026-03-01', '2026-03-14', 'ACTIVE',    10),
('Sprint 2 · Audit Logs',           '2026-03-15', '2026-03-28', 'PLANNED',   10),
('Sprint 1 · Compliance',           '2025-09-10', '2025-09-23', 'COMPLETED', 11),
('Sprint 2 · Archival',             '2025-09-24', '2025-10-07', 'COMPLETED', 11),
('Sprint 1 · KYC Flow',             '2026-02-25', '2026-03-10', 'ACTIVE',    12),
('Sprint 2 · e-Sign',               '2026-03-11', '2026-03-24', 'PLANNED',   12),
('Sprint 1 · Rules Engine',         '2026-03-05', '2026-03-18', 'ACTIVE',    13),
('Sprint 2 · ML Scoring',           '2026-03-19', '2026-04-01', 'PLANNED',   13),
('Sprint 1 · Fleet Onboarding',     '2025-11-01', '2025-11-14', 'COMPLETED', 14),
('Sprint 2 · Route Optimizer',      '2025-11-15', '2025-11-28', 'COMPLETED', 14),
('Sprint 1 · Requisitions',         '2026-03-20', '2026-04-02', 'ACTIVE',    15),
('Sprint 2 · Interview Scheduler',  '2026-04-03', '2026-04-16', 'PLANNED',   15);


-- ═══════════════════════════════════════════════════════════════════════
--  PROJECT TEAMS (15 — one per project, with team_name and scrum master)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO project_team (team_name, project_id, scrum_master_id) VALUES
('Phoenix Squad',      1,  7),   -- SM: Kiran Patel
('Atlas Avengers',     2,  9),   -- SM: Dev Joshi
('Orion Otters',       3, 11),   -- SM: Aarav Verma
('Titan Task Force',   4, 13),   -- SM: Rohan Desai
('Nimbus Ninjas',      5, 15),   -- SM: Karthik Menon
('Vortex Vanguard',    6, 17),   -- SM: Varun Agarwal
('Zephyr Zealots',     7, 19),   -- SM: Ramesh Kumar
('Quantum Quasar',     8, 21),   -- SM: Manish Chandra
('Nebula Knights',     9, 23),   -- SM: Nikhil Banerjee
('Echo Expedition',   10, 25),   -- SM: Pranav Saxena
('Sigma Syndicate',   11, 27),   -- SM: Siddharth Raj
('Helix Hawks',       12, 29),   -- SM: Harsh Singhania
('Apex Achievers',    13, 31),   -- SM: Aditya Thakur
('Stellar Strikers',  14, 33),   -- SM: Saurabh Mishra
('Falcon Force',      15, 35);   -- SM: Tushar Chauhan


-- ═══════════════════════════════════════════════════════════════════════
--  PROJECT-TEAM MEMBERSHIPS (30 — each developer belongs to exactly 1 team)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO project_team_users (team_id, user_id) VALUES
(1,  7), (1,  8),
(2,  9), (2, 10),
(3, 11), (3, 12),
(4, 13), (4, 14),
(5, 15), (5, 16),
(6, 17), (6, 18),
(7, 19), (7, 20),
(8, 21), (8, 22),
(9, 23), (9, 24),
(10, 25), (10, 26),
(11, 27), (11, 28),
(12, 29), (12, 30),
(13, 31), (13, 32),
(14, 33), (14, 34),
(15, 35), (15, 36);


-- ═══════════════════════════════════════════════════════════════════════
--  TICKETS (20) — mix of EPIC/USER_STORY/TASK/DEFECT/SUB_TASK
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO ticket (project_id, sprint_id, parent_id, assignee_id, reporter_id, type, status, story_points, title, description) VALUES
(1,  1, NULL,  7, 2, 'DEFECT',       'IN_PROGRESS', 20, 'Payment Gateway Integration',         'Integrate UPI, NEFT and card rails into the core-banking platform.'),
(1,  1,    1,  8, 7, 'DEFECT', 'IN_PROGRESS',  8, 'Customer pays vendor via UPI',        'As a customer I want to pay a vendor via UPI so that settlement is instant.'),
(1,  2,    2,  8, 7, 'DEFECT',       'COMPLETED',    2, 'Add UPI SDK dependency',              'Add the vendor UPI SDK to the gradle build and wire up initialisation.'),
(1,  2, NULL,  7, 2, 'DEFECT',     'IN_PROGRESS',  3, 'Timeout on bank verification',        'Bank verification intermittently times out after 30s.'),
(2,  3, NULL,  9, 2, 'DEFECT',       'IN_PROGRESS', 30, 'Patient Portal Rewrite',              'Rewrite the legacy JSP patient portal as an Angular SPA.'),
(2,  4,    5, 10, 9, 'DEFECT', 'TO_DO',        5, 'Book online appointment',             'As a patient I can book an appointment with a chosen doctor.'),
(3,  6, NULL, 12,11, 'DEFECT',       'COMPLETED',    5, 'Finalise analytics dashboard',        'Complete the analytics dashboard before go-live.'),
(4,  7, NULL, 13, 3, 'DEFECT', 'IN_PROGRESS',  8, 'Auto-triage claim by severity',       'The system should auto-triage claims based on severity score.'),
(4,  7, NULL, 14,13, 'DEFECT',     'REVIEW',       3, 'Claim ID collision on bulk upload',   'Duplicate claim IDs are silently overwritten during bulk upload.'),
(5,  9, NULL, 16,15, 'USER_STORY', 'IN_PROGRESS',  5, 'Teachers can schedule live classes',  'Teachers can schedule a live class and invite a cohort.'),
(6, 11, NULL, 17, 3, 'TASK',       'COMPLETED',    2, 'Apply security hardening patch',      'Apply the portal hardening patch issued by InfoSec.'),
(7, 13, NULL, 19, 4, 'USER_STORY', 'IN_PROGRESS', 13, 'Read legacy mainframe records',       'As a developer I can read records from the mainframe via the new adapter.'),
(8, 15, NULL, 22,21, 'TASK',       'COMPLETED',    3, 'Publish analytics dashboard',         'Publish factory KPI dashboard for stakeholder review.'),
(9, 17, NULL, 23, 4, 'DEFECT', 'TO_DO',        5, 'Reward points redemption',            'As a customer I can redeem reward points against a voucher.'),
(10,19, NULL, 25, 5, 'USER_STORY', 'IN_PROGRESS',  8, 'Multi-factor authentication',         'As an employee I am prompted for MFA on privileged actions.'),
(10,19,   15, 26,25, 'SUB_TASK',   'TO_DO',        2, 'Send OTP via SMS provider',           'Call the SMS provider API to deliver OTP.'),
(11,21, NULL, 28,27, 'DEFECT',       'COMPLETED',    3, 'Archive old patient records',         'Move records older than 7 years to cold storage.'),
(12,23, NULL, 29, 5, 'USER_STORY', 'IN_PROGRESS',  5, 'e-KYC document upload',               'As a new customer I can upload my e-KYC documents during onboarding.'),
(13,25, NULL, 32,31, 'DEFECT',     'IN_PROGRESS',  3, 'False-positive risk scoring',         'Model flags legitimate claims as fraud when balance is negative.'),
(14,28, NULL, 34,33, 'TASK',       'COMPLETED',    5, 'Finalize driver app release',         'Cut the driver app 2.0 release and submit to app stores.');


-- ═══════════════════════════════════════════════════════════════════════
--  TEST CASES (15) — authored by developers
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO test_case (description, designer_id, type, test_data, complexity, expected_result, actual_result, status) VALUES
('Verify UPI payment happy path',              8,  'FUNCTIONAL', 'amount=500 vendor=VPA1', 'MEDIUM',   'Payment succeeds',        'Payment succeeds',       'PASSED'),
('UPI timeout returns graceful error',         8,  'NEGATIVE',   'network=slow timeout=30s','COMPLEX',  'Timeout banner shown',    'App froze',              'FAILED'),
('Appointment form client-side validation',    10, 'UI',         'all-fields-empty',       'SIMPLE',   'Errors under each field', 'Errors under each field','PASSED'),
('Bulk claim upload with valid CSV',           14, 'POSITIVE',   '100 rows valid',         'MEDIUM',   'All accepted',            'All accepted',           'PASSED'),
('Bulk claim upload rejects duplicate IDs',    14, 'NEGATIVE',   'duplicate IDs',          'COMPLEX',  'Error lists duplicates',  'Silent overwrite',       'FAILED'),
('Live class scheduling conflict',             16, 'FUNCTIONAL', 'two classes same slot',  'MEDIUM',   'Conflict warning',        'Conflict warning',       'PASSED'),
('Security patch applied without downtime',    18, 'POSITIVE',   'rolling restart',        'CRITICAL', 'Zero downtime',           'Zero downtime',          'PASSED'),
('Mainframe read latency under load',          20, 'FUNCTIONAL', '10k records',            'COMPLEX',  'Latency under 2 seconds', 'Latency under 2 seconds','NEW'),
('Reward redemption below minimum points',     24, 'NEGATIVE',   'balance=10 points',      'SIMPLE',   'Redemption rejected',     'Redemption rejected',    'PASSED'),
('MFA with invalid OTP',                       26, 'NEGATIVE',   'otp=999999',             'MEDIUM',   'Retry prompt',            'Retry prompt',           'PASSED'),
('Archive job idempotency',                    28, 'FUNCTIONAL', 'job re-run same day',    'MEDIUM',   'No duplicate rows',       'No duplicate rows',      'PASSED'),
('KYC upload accepts 10MB PDF',                30, 'POSITIVE',   'doc=10MB.pdf',           'MEDIUM',   'Accepted and stored',     'Accepted and stored',    'PASSED'),
('Risk scoring on edge inputs',                32, 'NEGATIVE',   'balance=-1',             'COMPLEX',  'Flag for manual review',  'Returned score=0',       'FAILED'),
('Driver app push delivery when offline',      34, 'FUNCTIONAL', 'device offline',         'MEDIUM',   'Queued for retry',        'Queued for retry',       'PASSED'),
('Interview scheduler drag-and-drop',          36, 'UI',         'drag slot across days',  'SIMPLE',   'Slot moves to target',    'Slot moves to target',   'NEW');


-- ═══════════════════════════════════════════════════════════════════════
--  TEST-CASE ↔ USER-STORY LINKS (textcase_userstory, M2M) — 15 rows
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO textcase_userstory (test_case_id, ticket_id) VALUES
(1, 2),  (2, 4),  (3, 6),  (4, 8),  (5, 9),
(6, 10), (7, 11), (8, 12), (9, 14), (10, 15),
(11, 17), (12, 18), (13, 19), (14, 20), (15, 2);


-- ═══════════════════════════════════════════════════════════════════════
--  DEFECTS (15) — each bound to a distinct ticket (one-to-one)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO defect (ticket_id, reproducible, severity, status, test_case_id) VALUES
(1,  'SOMETIMES', 'HIGH',     'OPEN',        1),
(2,  'ALWAYS',    'CRITICAL', 'IN_PROGRESS', 2),
(3, 'SOMETIMES', 'HIGH',     'NEW',         3),
(4,  'ONCE',      'LOW',      'CLOSED',      4),
(5,  'ALWAYS',    'MEDIUM',   'OPEN',        5),
(6, 'SOMETIMES', 'MEDIUM',   'FIXED',       6),
(7, 'ALWAYS',    'HIGH',     'RETEST',      7),
(8, 'SOMETIMES', 'MEDIUM',   'OPEN',        8),
(9,  'ALWAYS',    'CRITICAL', 'REOPENED',    9),
(14, 'ONCE',      'LOW',      'DEFERRED',    10);
-- (14, 'ALWAYS',    'HIGH',     'OPEN',        8),
-- (20, 'SOMETIMES', 'LOW',      'CLOSED',      14),
-- (11, 'ONCE',      'LOW',      'REJECTED',    9),
-- (16, 'ALWAYS',    'MEDIUM',   'NEW',         11),
-- (17, 'SOMETIMES', 'CRITICAL', 'DUPLICATE',   15);


-- ═══════════════════════════════════════════════════════════════════════
--  DEFECT STEPS-TO-REPRODUCE (element collection, ~20 rows)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO defect_steps_to_reproduce (defect_id, steps_to_reproduce) VALUES
(1,  'Log in as customer and initiate a UPI payment'),
(1,  'Wait for bank verification screen for more than 30 seconds'),
(1,  'Observe blank screen instead of timeout dialog'),
(2,  'Upload a claims CSV containing two rows with the same claim ID'),
(2,  'Submit the batch without clicking validate'),
(2,  'Only one row is persisted — second row is lost silently'),
(3,  'Book a legitimate claim with balance -1'),
(3,  'Verify the risk score returned'),
(4,  'Open the UPI status page and hit refresh five times'),
(5,  'Book an appointment without selecting a doctor'),
(5,  'Form should reject submission but accepts empty doctor'),
(6,  'Schedule a live class and immediately cancel'),
(7,  'Enter the wrong OTP on MFA prompt'),
(7,  'Confirm that retry counter increments'),
(8,  'Upload a 10MB PDF to KYC'),
(9,  'Trigger mainframe read with 10k records'),
(10, 'Redeem reward points beyond available balance');
-- (11, 'Re-run archival job on same cut-off date'),
-- (12, 'Cut a driver app release and verify version code'),
-- (15, 'Apply security patch and observe duplicate logging');


-- ═══════════════════════════════════════════════════════════════════════
--  COMMENTS (15)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO comment (ticket_id, user_id, comment_body, created_at) VALUES
(1,  2,  'Great progress — let us aim to close the scoping by end of sprint.',                         NOW() - INTERVAL 10 DAY),
(2,  7,  'I have broken this down into three tasks, will pull them into sprint 2.',                    NOW() - INTERVAL 9 DAY),
(3,  8,  'SDK is bundled, but the sandbox credentials are still pending.',                             NOW() - INTERVAL 8 DAY),
(4,  7,  'Reproduced on staging. Looks like the bank API is rate-limiting us.',                        NOW() - INTERVAL 7 DAY),
(5,  2,  'Please sync with the UX team before starting the Angular migration.',                        NOW() - INTERVAL 6 DAY),
(6, 10,  'Will write the appointment cancellation flow next.',                                         NOW() - INTERVAL 6 DAY),
(8,  3,  'Bumped the priority — Ops is tracking this for the SLA dashboard.',                          NOW() - INTERVAL 5 DAY),
(9, 14,  'Added a unique constraint on claim_id; ready for review.',                                   NOW() - INTERVAL 4 DAY),
(10, 15, 'Need capacity confirmation from teachers before go-live.',                                   NOW() - INTERVAL 4 DAY),
(12, 19, 'Mainframe team is blocking on a keytab — raised a ticket to InfoSec.',                       NOW() - INTERVAL 3 DAY),
(14, 23, 'Marketing wants a banner for double-points weekend.',                                        NOW() - INTERVAL 3 DAY),
(15, 25, 'Working with the SMS vendor to reduce OTP delivery latency.',                                NOW() - INTERVAL 2 DAY),
(18, 29, 'Added Aadhaar XML parser — covered with unit tests.',                                        NOW() - INTERVAL 2 DAY),
(19, 32, 'The ML model was trained without handling negative balances. Re-training needed.',           NOW() - INTERVAL 1 DAY),
(20, 33, 'Release candidate cut, smoke tests green.',                                                  NOW() - INTERVAL 1 DAY);


-- ═══════════════════════════════════════════════════════════════════════
--  ATTACHMENTS (15)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO attachment (ticket_id, file_url, uploaded_at) VALUES
(1,  'https://files.projectsphere.local/epics/payment-gateway-scope.pdf',          NOW() - INTERVAL 11 DAY),
(2,  'https://files.projectsphere.local/us/upi-flow-wireframe.png',                NOW() - INTERVAL 10 DAY),
(3,  'https://files.projectsphere.local/tasks/upi-sdk-dependency-diff.patch',      NOW() - INTERVAL 9 DAY),
(4,  'https://files.projectsphere.local/defects/bank-verification-logs.txt',       NOW() - INTERVAL 7 DAY),
(5,  'https://files.projectsphere.local/epics/patient-portal-roadmap.xlsx',        NOW() - INTERVAL 6 DAY),
(6,  'https://files.projectsphere.local/us/appointment-flow.png',                  NOW() - INTERVAL 6 DAY),
(8,  'https://files.projectsphere.local/us/claims-triage-spec.docx',               NOW() - INTERVAL 5 DAY),
(9,  'https://files.projectsphere.local/defects/bulk-upload-sample.csv',           NOW() - INTERVAL 5 DAY),
(10, 'https://files.projectsphere.local/us/live-classes-spec.pdf',                 NOW() - INTERVAL 4 DAY),
(12, 'https://files.projectsphere.local/us/mainframe-adapter-design.pdf',          NOW() - INTERVAL 4 DAY),
(14, 'https://files.projectsphere.local/us/loyalty-voucher-rules.xlsx',            NOW() - INTERVAL 3 DAY),
(15, 'https://files.projectsphere.local/us/mfa-sequence-diagram.png',              NOW() - INTERVAL 3 DAY),
(18, 'https://files.projectsphere.local/us/e-kyc-xsd-schema.xsd',                  NOW() - INTERVAL 2 DAY),
(19, 'https://files.projectsphere.local/defects/risk-score-edge-cases.csv',        NOW() - INTERVAL 2 DAY),
(20, 'https://files.projectsphere.local/tasks/driver-app-release-notes.md',        NOW() - INTERVAL 1 DAY);


-- ═══════════════════════════════════════════════════════════════════════
--  TICKET HISTORY (15)
-- ═══════════════════════════════════════════════════════════════════════
INSERT INTO ticket_history (ticket_id, changed_by, field_changed, old_value, new_value, time_stamp) VALUES
(1,  2, 'status',      'TO_DO',       'IN_PROGRESS',  NOW() - INTERVAL 12 DAY),
(2,  7, 'assignee',    '7',           '8',            NOW() - INTERVAL 10 DAY),
(3,  8, 'status',      'IN_PROGRESS', 'COMPLETED',    NOW() - INTERVAL 9 DAY),
(4,  7, 'status',      'TO_DO',       'IN_PROGRESS',  NOW() - INTERVAL 7 DAY),
(5,  2, 'storyPoints', '20',          '30',           NOW() - INTERVAL 6 DAY),
(6, 10, 'description', '',            'Booking v1 scoped',  NOW() - INTERVAL 5 DAY),
(7, 11, 'status',      'IN_PROGRESS', 'COMPLETED',    NOW() - INTERVAL 35 DAY),
(8,  3, 'assignee',    '3',           '13',           NOW() - INTERVAL 5 DAY),
(9, 13, 'status',      'IN_PROGRESS', 'REVIEW',       NOW() - INTERVAL 4 DAY),
(10,15, 'status',      'TO_DO',       'IN_PROGRESS',  NOW() - INTERVAL 4 DAY),
(12, 4, 'assignee',    '4',           '19',           NOW() - INTERVAL 3 DAY),
(14, 4, 'title',       'Loyalty redemption', 'Reward points redemption', NOW() - INTERVAL 3 DAY),
(15, 5, 'status',      'TO_DO',       'IN_PROGRESS',  NOW() - INTERVAL 2 DAY),
(19,31, 'status',      'TO_DO',       'IN_PROGRESS',  NOW() - INTERVAL 1 DAY),
(20,33, 'status',      'IN_PROGRESS', 'COMPLETED',    NOW() - INTERVAL 1 DAY);
