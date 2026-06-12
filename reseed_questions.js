const mysql = require('mysql2/promise');

const QUESTIONS = [
  // ─── Requirements (5) ───
  { area: 'Requirements', subArea: 'Idea Exploration', practice: 'Generative Research', questionText: 'To what extent does your team use AI tools (e.g. ChatGPT, Gemini) to generate, explore and validate new product ideas before requirements are written?' },
  { area: 'Requirements', subArea: 'Elicitation & Documentation', practice: 'Automated Documentation', questionText: 'How does your team leverage AI for requirements elicitation, auto-generating user stories, acceptance criteria and BRDs from stakeholder interviews or recordings?' },
  { area: 'Requirements', subArea: 'Backlog Management', practice: 'Intelligent Prioritisation', questionText: 'To what extent is AI used to analyse backlog items, detect duplicate stories, predict effort estimates and suggest sprint prioritisation?' },
  { area: 'Requirements', subArea: 'Impact Analysis', practice: 'Change Risk Scoring', questionText: 'How does your team use AI to assess the downstream impact of requirement changes — automatically flagging affected components, tests, and dependent teams?' },
  { area: 'Requirements', subArea: 'Traceability', practice: 'Bidirectional Linking', questionText: 'To what extent does your team use AI to maintain bidirectional traceability from business goals → requirements → code → test cases, with automated drift detection?' },

  // ─── Architecture (5) ───
  { area: 'Architecture', subArea: 'Design Synthesis', practice: 'AI-Assisted Architecture', questionText: 'To what extent does your team use AI tools to synthesise and propose system architecture options, evaluate trade-offs, and recommend design patterns?' },
  { area: 'Architecture', subArea: 'Diagram Generation', practice: 'Auto-Diagramming', questionText: 'How is AI used to automatically generate and keep architecture diagrams (C4, UML, sequence diagrams) in sync with the actual codebase?' },
  { area: 'Architecture', subArea: 'PR Drift Detection', practice: 'Architecture Governance', questionText: 'To what extent does your CI/CD pipeline use AI to detect when pull requests violate or drift from documented architecture decisions (ADRs)?' },
  { area: 'Architecture', subArea: 'Compliance & Security', practice: 'Automated Governance', questionText: 'How does your team use AI for architecture compliance checking — validating that designs meet regulatory, security and cloud-vendor best-practice requirements?' },
  { area: 'Architecture', subArea: 'FinOps & Cost Optimisation', practice: 'AI-Driven Cost Analysis', questionText: 'To what extent is AI integrated into your architecture review process to model infrastructure cost, predict cloud spend, and recommend cost-optimisation strategies?' },

  // ─── Development (5) ───
  { area: 'Development', subArea: 'Code Generation', practice: 'AI Pair Programming', questionText: 'To what extent does your team use AI coding assistants (e.g. Cursor, Copilot, Cline) to write, complete, refactor and explain code during development?' },
  { area: 'Development', subArea: 'Pull Requests', practice: 'Agentic PR Creation', questionText: 'How is AI used to autonomously open pull requests, write PR descriptions, summarise diffs, and auto-assign reviewers based on code ownership?' },
  { area: 'Development', subArea: 'Test Generation', practice: 'AI-Generated Unit Tests', questionText: 'To what extent does your team use AI to auto-generate unit tests, assert edge cases, and maintain test coverage as the codebase evolves?' },
  { area: 'Development', subArea: 'Security & Dependencies', practice: 'AI-Driven Scanning', questionText: 'How is AI used to analyse dependency graphs, detect vulnerabilities, and recommend secure upgrades or alternative libraries during development?' },
  { area: 'Development', subArea: 'Custom Tooling', practice: 'MCP & Agent Scripts', questionText: 'To what extent does your team build and use custom AI agents or MCP-connected scripts to automate repetitive development workflows beyond standard coding assistants?' },

  // ─── Testing (5) ───
  { area: 'Testing', subArea: 'E2E Automation', practice: 'AI-Driven Test Suites', questionText: 'To what extent does your team use AI to generate, maintain and self-heal end-to-end test scripts across UI, API and integration layers?' },
  { area: 'Testing', subArea: 'Test Data Management', practice: 'Synthetic Data Generation', questionText: 'How is AI used to generate realistic, privacy-safe synthetic test data sets that cover edge cases, boundary conditions, and GDPR compliance scenarios?' },
  { area: 'Testing', subArea: 'Defect Management', practice: 'AI Defect Classification', questionText: 'To what extent does your team use AI to automatically classify and route incoming defects, detect duplicate bugs, and predict root causes from stack traces?' },
  { area: 'Testing', subArea: 'Test Prioritisation', practice: 'Risk-Based Test Selection', questionText: 'How does your team use AI to prioritise which test cases to run based on code changes, historical failure rates, and risk scoring — optimising test execution time?' },
  { area: 'Testing', subArea: 'Performance Testing', practice: 'AI-Augmented Load Testing', questionText: 'To what extent is AI used to design performance test scenarios, analyse load test results, detect anomalies, and recommend infrastructure scaling actions?' },

  // ─── Deployment (5) ───
  { area: 'Deployment', subArea: 'Release Notes', practice: 'Automated Release Documentation', questionText: 'To what extent does your team use AI to automatically generate release notes, changelogs and stakeholder communications from commit history and PR descriptions?' },
  { area: 'Deployment', subArea: 'Capacity Planning', practice: 'Predictive Scaling', questionText: 'How is AI used to analyse traffic patterns, predict infrastructure demand, and automatically adjust capacity before load events — rather than reacting to incidents?' },
  { area: 'Deployment', subArea: 'CI/CD Pipelines', practice: 'AI Quality Gates', questionText: 'To what extent are AI-powered quality gates integrated into your CI/CD pipeline to block deployments based on code quality, test coverage, and security scan results?' },
  { area: 'Deployment', subArea: 'Self-Healing Systems', practice: 'Autonomous Remediation', questionText: 'How does your production environment use AI to detect anomalies, trigger auto-rollbacks, reroute traffic, and self-remediate incidents without human intervention?' },
  { area: 'Deployment', subArea: 'Observability & Monitoring', practice: 'AI-Driven Insights', questionText: 'To what extent does your team use AI-enhanced observability tools to correlate logs, traces and metrics — proactively detecting and diagnosing issues before they impact users?' },
];

async function reseedQuestions() {
  const conn = await mysql.createConnection({
    host: 'localhost', user: 'root', password: 'root123', database: 'sdlc_maturity'
  });

  try {
    // Clear existing questions
    await conn.execute('DELETE FROM questions');
    console.log('✓ Cleared existing questions');

    // Insert new 25 questions
    for (const q of QUESTIONS) {
      await conn.execute(
        'INSERT INTO questions (area, sub_area, practice, type, question_text) VALUES (?, ?, ?, ?, ?)',
        [q.area, q.subArea, q.practice, 'extent', q.questionText]
      );
    }
    console.log(`✓ Inserted ${QUESTIONS.length} questions (5 per section)`);

    // Verify
    const [rows] = await conn.execute('SELECT area, COUNT(*) as cnt FROM questions GROUP BY area ORDER BY area');
    console.log('\nQuestion distribution:');
    rows.forEach(r => console.log(`  ${r.area}: ${r.cnt} questions`));

  } finally {
    await conn.end();
    console.log('\n✓ Done!');
  }
}

reseedQuestions().catch(console.error);
