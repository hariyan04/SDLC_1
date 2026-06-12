const fs = require('fs');
const path = require('path');

const questions = [
  // --- Requirements (5) ---
  {
    id: 1,
    area: "Requirements",
    subArea: "Idea Exploration",
    practice: "Generative Research",
    type: "extent",
    questionText: "To what extent does your team use AI tools (e.g. ChatGPT, Gemini) to generate, explore and validate new product ideas before requirements are written?"
  },
  {
    id: 2,
    area: "Requirements",
    subArea: "Elicitation & Documentation",
    practice: "Automated Documentation",
    type: "extent",
    questionText: "How does your team leverage AI for requirements elicitation, auto-generating user stories, acceptance criteria and BRDs from stakeholder interviews or recordings?"
  },
  {
    id: 3,
    area: "Requirements",
    subArea: "Backlog Management",
    practice: "Intelligent Prioritisation",
    type: "extent",
    questionText: "To what extent is AI used to analyse backlog items, detect duplicate stories, predict effort estimates and suggest sprint prioritisation?"
  },
  {
    id: 4,
    area: "Requirements",
    subArea: "Impact Analysis",
    practice: "Change Risk Scoring",
    type: "extent",
    questionText: "How does your team use AI to assess the downstream impact of requirement changes — automatically flagging affected components, tests, and dependent teams?"
  },
  {
    id: 5,
    area: "Requirements",
    subArea: "Traceability",
    practice: "Bidirectional Linking",
    type: "extent",
    questionText: "To what extent does your team use AI to maintain bidirectional traceability from business goals → requirements → code → test cases, with automated drift detection?"
  },

  // --- Architecture (5) ---
  {
    id: 6,
    area: "Architecture",
    subArea: "Design Synthesis",
    practice: "AI-Assisted Architecture",
    type: "extent",
    questionText: "To what extent does your team use AI tools to synthesise and propose system architecture options, evaluate trade-offs, and recommend design patterns?"
  },
  {
    id: 7,
    area: "Architecture",
    subArea: "Diagram Generation",
    practice: "Auto-Diagramming",
    type: "extent",
    questionText: "How is AI used to automatically generate and keep architecture diagrams (C4, UML, sequence diagrams) in sync with the actual codebase?"
  },
  {
    id: 8,
    area: "Architecture",
    subArea: "PR Drift Detection",
    practice: "Architecture Governance",
    type: "extent",
    questionText: "To what extent does your CI/CD pipeline use AI to detect when pull requests violate or drift from documented architecture decisions (ADRs)?"
  },
  {
    id: 9,
    area: "Architecture",
    subArea: "Compliance & Security",
    practice: "Automated Governance",
    type: "extent",
    questionText: "How does your team use AI for architecture compliance checking — validating that designs meet regulatory, security and cloud-vendor best-practice requirements?"
  },
  {
    id: 10,
    area: "Architecture",
    subArea: "FinOps & Cost Optimisation",
    practice: "AI-Driven Cost Analysis",
    type: "extent",
    questionText: "To what extent is AI integrated into your architecture review process to model infrastructure cost, predict cloud spend, and recommend cost-optimisation strategies?"
  },

  // --- Development (5) ---
  {
    id: 11,
    area: "Development",
    subArea: "Code Generation",
    practice: "AI Pair Programming",
    type: "extent",
    questionText: "To what extent does your team use AI coding assistants (e.g. Cursor, Copilot, Cline) to write, complete, refactor and explain code during development?"
  },
  {
    id: 12,
    area: "Development",
    subArea: "Pull Requests",
    practice: "Agentic PR Creation",
    type: "extent",
    questionText: "How is AI used to autonomously open pull requests, write PR descriptions, summarise diffs, and auto-assign reviewers based on code ownership?"
  },
  {
    id: 13,
    area: "Development",
    subArea: "Test Generation",
    practice: "AI-Generated Unit Tests",
    type: "extent",
    questionText: "To what extent does your team use AI to auto-generate unit tests, assert edge cases, and maintain test coverage as the codebase evolves?"
  },
  {
    id: 14,
    area: "Development",
    subArea: "Security & Dependencies",
    practice: "AI-Driven Scanning",
    type: "extent",
    questionText: "How is AI used to analyse dependency graphs, detect vulnerabilities, and recommend secure upgrades or alternative libraries during development?"
  },
  {
    id: 15,
    area: "Development",
    subArea: "Custom Tooling",
    practice: "MCP & Agent Scripts",
    type: "extent",
    questionText: "To what extent does your team build and use custom AI agents or MCP-connected scripts to automate repetitive development workflows beyond standard coding assistants?"
  },

  // --- Testing (5) ---
  {
    id: 16,
    area: "Testing",
    subArea: "E2E Automation",
    practice: "AI-Driven Test Suites",
    type: "extent",
    questionText: "To what extent does your team use AI to generate, maintain and self-heal end-to-end test scripts across UI, API and integration layers?"
  },
  {
    id: 17,
    area: "Testing",
    subArea: "Test Data Management",
    practice: "Synthetic Data Generation",
    type: "extent",
    questionText: "How is AI used to generate realistic, privacy-safe synthetic test data sets that cover edge cases, boundary conditions, and GDPR compliance scenarios?"
  },
  {
    id: 18,
    area: "Testing",
    subArea: "Defect Management",
    practice: "AI Defect Classification",
    type: "extent",
    questionText: "To what extent does your team use AI to automatically classify and route incoming defects, detect duplicate bugs, and predict root causes from stack traces?"
  },
  {
    id: 19,
    area: "Testing",
    subArea: "Test Prioritisation",
    practice: "Risk-Based Test Selection",
    type: "extent",
    questionText: "How does your team use AI to prioritise which test cases to run based on code changes, historical failure rates, and risk scoring — optimising test execution time?"
  },
  {
    id: 20,
    area: "Testing",
    subArea: "Performance Testing",
    practice: "AI-Augmented Load Testing",
    type: "extent",
    questionText: "To what extent is AI used to design performance test scenarios, analyse load test results, detect anomalies, and recommend infrastructure scaling actions?"
  },

  // --- Deployment (5) ---
  {
    id: 21,
    area: "Deployment",
    subArea: "Release Notes",
    practice: "Automated Release Documentation",
    type: "extent",
    questionText: "To what extent does your team use AI to automatically generate release notes, changelogs and stakeholder communications from commit history and PR descriptions?"
  },
  {
    id: 22,
    area: "Deployment",
    subArea: "Capacity Planning",
    practice: "Predictive Scaling",
    type: "extent",
    questionText: "How is AI used to analyse traffic patterns, predict infrastructure demand, and automatically adjust capacity before load events — rather than reacting to incidents?"
  },
  {
    id: 23,
    area: "Deployment",
    subArea: "CI/CD Pipelines",
    practice: "AI Quality Gates",
    type: "extent",
    questionText: "To what extent are AI-powered quality gates integrated into your CI/CD pipeline to block deployments based on code quality, test coverage, and security scan results?"
  },
  {
    id: 24,
    area: "Deployment",
    subArea: "Self-Healing Systems",
    practice: "Autonomous Remediation",
    type: "extent",
    questionText: "How does your production environment use AI to detect anomalies, trigger auto-rollbacks, reroute traffic, and self-remediate incidents without human intervention?"
  },
  {
    id: 25,
    area: "Deployment",
    subArea: "Observability & Monitoring",
    practice: "AI-Driven Insights",
    type: "extent",
    questionText: "To what extent does your team use AI-enhanced observability tools to correlate logs, traces and metrics — proactively detecting and diagnosing issues before they impact users?"
  }
];

const dbData = {
  users: [],
  assessments: [],
  feedback: [],
  settings: {
    activeAIProvider: "expert",
    apiKeys: {
      openai: "",
      gemini: "",
      claude: ""
    },
    ollamaUrl: "http://localhost:11434",
    ollamaModel: "llama3"
  },
  questions: questions
};

const dbPath = path.join(__dirname, 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
console.log('Database file db.json successfully generated with 120 default questions!');
