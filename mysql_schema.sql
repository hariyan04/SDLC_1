-- ================================================
-- SDLC Maturity Assessment App - MySQL Schema
-- ================================================

CREATE DATABASE IF NOT EXISTS sdlc_maturity CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sdlc_maturity;

-- ------------------------------------------------
-- Users Table
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------
-- Questions Table
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  area VARCHAR(100) NOT NULL,
  sub_area VARCHAR(300) NOT NULL,
  practice VARCHAR(400) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'extent',
  question_text TEXT NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------
-- Assessments Table
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  user_email VARCHAR(255),
  project_name VARCHAR(255) NOT NULL,
  answers JSON,
  scores JSON,
  remarks LONGTEXT,
  remarks_provider VARCHAR(50),
  feedback JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------
-- Feedback Table
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(50) PRIMARY KEY,
  assessment_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  user_email VARCHAR(255),
  rating INT NOT NULL,
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------
-- Settings Table (single-row config)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  active_ai_provider VARCHAR(50) NOT NULL DEFAULT 'ollama',
  api_keys JSON,
  ollama_url VARCHAR(255) DEFAULT 'http://localhost:11434',
  ollama_model VARCHAR(100) DEFAULT 'llama3'
) ENGINE=InnoDB;

-- ------------------------------------------------
-- Seed: Default Admin User (password: admin123)
-- ------------------------------------------------
INSERT IGNORE INTO users (id, email, password, role)
VALUES (
  'admin_user',
  'admin@sdlc.com',
  '$2a$10$e3lC5nLrQEWCmu15W69ux./xMB45aDURPA3skiFXmcmmySIWCAD.G',
  'admin'
);

-- ------------------------------------------------
-- Seed: Default Settings (Llama via Ollama)
-- ------------------------------------------------
INSERT IGNORE INTO settings (id, active_ai_provider, api_keys, ollama_url, ollama_model)
VALUES (
  1,
  'ollama',
  '{"openai":"","gemini":"","claude":""}',
  'http://localhost:11434',
  'llama3'
);

-- ------------------------------------------------
-- Seed: Questions (25 default questions, 5 per section)
-- ------------------------------------------------
INSERT IGNORE INTO questions (id, area, sub_area, practice, type, question_text) VALUES
(1,'Requirements','Idea Exploration','Generative Research','extent','To what extent does your team use AI tools (e.g. ChatGPT, Gemini) to generate, explore and validate new product ideas before requirements are written?'),
(2,'Requirements','Elicitation & Documentation','Automated Documentation','extent','How does your team leverage AI for requirements elicitation, auto-generating user stories, acceptance criteria and BRDs from stakeholder interviews or recordings?'),
(3,'Requirements','Backlog Management','Intelligent Prioritisation','extent','To what extent is AI used to analyse backlog items, detect duplicate stories, predict effort estimates and suggest sprint prioritisation?'),
(4,'Requirements','Impact Analysis','Change Risk Scoring','extent','How does your team use AI to assess the downstream impact of requirement changes — automatically flagging affected components, tests, and dependent teams?'),
(5,'Requirements','Traceability','Bidirectional Linking','extent','To what extent does your team use AI to maintain bidirectional traceability from business goals → requirements → code → test cases, with automated drift detection?'),
(6,'Architecture','Design Synthesis','AI-Assisted Architecture','extent','To what extent does your team use AI tools to synthesise and propose system architecture options, evaluate trade-offs, and recommend design patterns?'),
(7,'Architecture','Diagram Generation','Auto-Diagramming','extent','How is AI used to automatically generate and keep architecture diagrams (C4, UML, sequence diagrams) in sync with the actual codebase?'),
(8,'Architecture','PR Drift Detection','Architecture Governance','extent','To what extent does your CI/CD pipeline use AI to detect when pull requests violate or drift from documented architecture decisions (ADRs)?'),
(9,'Architecture','Compliance & Security','Automated Governance','extent','How does your team use AI for architecture compliance checking — validating that designs meet regulatory, security and cloud-vendor best-practice requirements?'),
(10,'Architecture','FinOps & Cost Optimisation','AI-Driven Cost Analysis','extent','To what extent is AI integrated into your architecture review process to model infrastructure cost, predict cloud spend, and recommend cost-optimisation strategies?'),
(11,'Development','Code Generation','AI Pair Programming','extent','To what extent does your team use AI coding assistants (e.g. Cursor, Copilot, Cline) to write, complete, refactor and explain code during development?'),
(12,'Development','Pull Requests','Agentic PR Creation','extent','How is AI used to autonomously open pull requests, write PR descriptions, summarise diffs, and auto-assign reviewers based on code ownership?'),
(13,'Development','Test Generation','AI-Generated Unit Tests','extent','To what extent does your team use AI to auto-generate unit tests, assert edge cases, and maintain test coverage as the codebase evolves?'),
(14,'Development','Security & Dependencies','AI-Driven Scanning','extent','How is AI used to analyse dependency graphs, detect vulnerabilities, and recommend secure upgrades or alternative libraries during development?'),
(15,'Development','Custom Tooling','MCP & Agent Scripts','extent','To what extent does your team build and use custom AI agents or MCP-connected scripts to automate repetitive development workflows beyond standard coding assistants?'),
(16,'Testing','E2E Automation','AI-Driven Test Suites','extent','To what extent does your team use AI to generate, maintain and self-heal end-to-end test scripts across UI, API and integration layers?'),
(17,'Testing','Test Data Management','Synthetic Data Generation','extent','How is AI used to generate realistic, privacy-safe synthetic test data sets that cover edge cases, boundary conditions, and GDPR compliance scenarios?'),
(18,'Testing','Defect Management','AI Defect Classification','extent','To what extent does your team use AI to automatically classify and route incoming defects, detect duplicate bugs, and predict root causes from stack traces?'),
(19,'Testing','Test Prioritisation','Risk-Based Test Selection','extent','How does your team use AI to prioritise which test cases to run based on code changes, historical failure rates, and risk scoring — optimising test execution time?'),
(20,'Testing','Performance Testing','AI-Augmented Load Testing','extent','To what extent is AI used to design performance test scenarios, analyse load test results, detect anomalies, and recommend infrastructure scaling actions?'),
(21,'Deployment','Release Notes','Automated Release Documentation','extent','To what extent does your team use AI to automatically generate release notes, changelogs and stakeholder communications from commit history and PR descriptions?'),
(22,'Deployment','Capacity Planning','Predictive Scaling','extent','How is AI used to analyse traffic patterns, predict infrastructure demand, and automatically adjust capacity before load events — rather than reacting to incidents?'),
(23,'Deployment','CI/CD Pipelines','AI Quality Gates','extent','To what extent are AI-powered quality gates integrated into your CI/CD pipeline to block deployments based on code quality, test coverage, and security scan results?'),
(24,'Deployment','Self-Healing Systems','Autonomous Remediation','extent','How does your production environment use AI to detect anomalies, trigger auto-rollbacks, reroute traffic, and self-remediate incidents without human intervention?'),
(25,'Deployment','Observability & Monitoring','AI-Driven Insights','extent','To what extent does your team use AI-enhanced observability tools to correlate logs, traces and metrics — proactively detecting and diagnosing issues before they impact users?');
