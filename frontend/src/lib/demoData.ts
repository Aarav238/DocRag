// Demo documents content for showcase mode
export interface DemoDocument {
  name: string;
  content: string;
}

export const demoDocuments: DemoDocument[] = [
  {
    name: 'TechCorp_Investment_Pitch.pdf',
    content: `
TechCorp Investment Pitch Deck

EXECUTIVE SUMMARY
TechCorp is a B2B SaaS company revolutionizing enterprise document management through AI-powered automation. We're seeking $5M Series A funding to accelerate growth and expand our market presence.

MARKET OPPORTUNITY
The global document management market is projected to reach $10.17 billion by 2025, growing at a CAGR of 13.2%. Enterprise companies spend an average of 8 hours per week per employee on document-related tasks.

Key Market Drivers:
- Digital transformation initiatives
- Remote work acceleration
- Compliance and regulatory requirements
- Need for operational efficiency

PROBLEM
Enterprises struggle with:
- Manual document processing consuming 40% of employee time
- Inconsistent document quality and formatting
- Difficulty finding information across thousands of documents
- Compliance risks from human errors

SOLUTION
TechCorp's AI-powered platform offers:
- Automated document generation from templates
- Smart search across all company documents
- Real-time collaboration and version control
- Compliance monitoring and audit trails

TRACTION
- $1.2M ARR (300% YoY growth)
- 50+ enterprise customers
- 98% customer retention rate
- NPS score of 72

BUSINESS MODEL
SaaS subscription model:
- Starter: $500/month (up to 10 users)
- Professional: $2,000/month (up to 50 users)
- Enterprise: Custom pricing (unlimited users)

Average contract value: $45,000/year

TEAM
- CEO: Jane Smith - Former VP at DocuSign, 15 years enterprise software
- CTO: John Doe - Ex-Google, ML/AI specialist
- VP Sales: Sarah Johnson - Built sales teams at Salesforce and Box

FINANCIAL PROJECTIONS
Year 1: $3M ARR
Year 2: $8M ARR
Year 3: $20M ARR

INVESTMENT ASK
Raising $5M Series A at $20M pre-money valuation

Use of Funds:
- 50% Sales & Marketing
- 30% Product Development
- 20% Operations

CONTACT
investors@techcorp.ai
www.techcorp.ai
`,
  },
  {
    name: 'Software_Development_Agreement.pdf',
    content: `
SOFTWARE DEVELOPMENT AGREEMENT

This Software Development Agreement ("Agreement") is entered into as of [DATE] by and between:

CLIENT: Acme Corporation
Address: 123 Business Park, San Francisco, CA 94102

DEVELOPER: DevStudio Inc.
Address: 456 Tech Lane, Austin, TX 78701

1. SCOPE OF SERVICES

1.1 Project Description
Developer agrees to design, develop, and deliver a custom enterprise resource planning (ERP) system ("Software") according to the specifications outlined in Exhibit A.

1.2 Deliverables
- Requirements documentation
- System architecture design
- Frontend application (React)
- Backend API (Node.js)
- Database design and implementation
- User documentation
- Training materials

1.3 Timeline
- Phase 1 (Requirements): 4 weeks
- Phase 2 (Design): 6 weeks
- Phase 3 (Development): 16 weeks
- Phase 4 (Testing): 4 weeks
- Phase 5 (Deployment): 2 weeks

2. COMPENSATION

2.1 Total Project Fee: $450,000 USD

2.2 Payment Schedule:
- 20% upon signing ($90,000)
- 20% upon design approval ($90,000)
- 30% upon beta delivery ($135,000)
- 20% upon final delivery ($90,000)
- 10% upon 30-day acceptance ($45,000)

3. INTELLECTUAL PROPERTY

3.1 Work Product
All work product created by Developer specifically for this project shall be owned by Client upon full payment.

3.2 Pre-existing Materials
Developer retains ownership of pre-existing tools, libraries, and frameworks used in the project.

4. CONFIDENTIALITY

4.1 Both parties agree to maintain confidentiality of all proprietary information exchanged during this engagement.

4.2 Confidential information includes but is not limited to:
- Business strategies and plans
- Customer data and lists
- Technical specifications
- Financial information

5. WARRANTIES

5.1 Developer warrants that:
- The Software will perform according to specifications
- The Software will be free from material defects for 90 days
- Developer has the right to perform these services

6. LIMITATION OF LIABILITY

6.1 Neither party shall be liable for indirect, incidental, or consequential damages.

6.2 Total liability shall not exceed the total fees paid under this Agreement.

7. TERMINATION

7.1 Either party may terminate with 30 days written notice.

7.2 Upon termination, Client shall pay for all work completed to date.

8. GOVERNING LAW

This Agreement shall be governed by the laws of the State of California.

SIGNATURES

_______________________
Client Representative
Date: _______________

_______________________
Developer Representative
Date: _______________
`,
  },
  {
    name: 'Q4_2024_Status_Report.pdf',
    content: `
Q4 2024 PROJECT STATUS REPORT

Project: Enterprise Platform Modernization
Report Date: December 15, 2024
Project Manager: Michael Chen
Status: ON TRACK

EXECUTIVE SUMMARY

The Enterprise Platform Modernization project remains on track for Q1 2025 delivery. Key milestones for Q4 have been achieved, including completion of the microservices migration and successful load testing. Budget utilization is at 78% with no overruns projected.

KEY ACCOMPLISHMENTS THIS QUARTER

1. Infrastructure Migration (Complete)
   - Migrated 12 legacy services to Kubernetes
   - Achieved 99.9% uptime during transition
   - Reduced infrastructure costs by 35%

2. API Gateway Implementation (Complete)
   - Deployed Kong API Gateway
   - Implemented rate limiting and authentication
   - Created developer portal with documentation

3. Database Optimization (Complete)
   - Migrated from Oracle to PostgreSQL
   - Implemented read replicas for scaling
   - Reduced query response time by 60%

4. Security Enhancements (In Progress - 85%)
   - Implemented OAuth 2.0 / OIDC
   - Completed SOC 2 Type II audit
   - Pending: Final penetration testing

WORK IN PROGRESS

| Task | Owner | Status | ETA |
|------|-------|--------|-----|
| Penetration Testing | Security Team | In Progress | Dec 22 |
| User Training | L&D Team | In Progress | Jan 10 |
| Documentation | Tech Writers | In Progress | Jan 5 |
| Performance Tuning | DevOps | Starting | Jan 8 |

UPCOMING MILESTONES

- Dec 22: Security testing complete
- Jan 5: Documentation finalized
- Jan 15: User acceptance testing begins
- Jan 30: Go-live preparation
- Feb 15: Production deployment

RISKS AND ISSUES

Risk 1: Holiday staffing (MEDIUM)
- Impact: Potential delays in issue resolution
- Mitigation: On-call rotation established

Risk 2: Third-party API dependency (LOW)
- Impact: Integration delays
- Mitigation: Fallback endpoints configured

Issue 1: Performance regression in reporting module (RESOLVED)
- Root cause: Unoptimized database queries
- Resolution: Query optimization completed Dec 10

BUDGET STATUS

| Category | Budgeted | Spent | Remaining |
|----------|----------|-------|-----------|
| Personnel | $800,000 | $650,000 | $150,000 |
| Infrastructure | $200,000 | $145,000 | $55,000 |
| Software Licenses | $100,000 | $85,000 | $15,000 |
| Contingency | $100,000 | $25,000 | $75,000 |
| TOTAL | $1,200,000 | $905,000 | $295,000 |

TEAM UPDATES

- Added 2 senior developers to accelerate testing phase
- Security specialist joined for penetration testing
- No departures this quarter

NEXT STEPS

1. Complete security testing by Dec 22
2. Finalize all documentation by Jan 5
3. Begin UAT preparation
4. Schedule go-live dry run
5. Prepare rollback procedures

APPENDIX

A. Detailed timeline (attached)
B. Architecture diagrams (attached)
C. Test results summary (attached)
`,
  },
];

export const demoInstructions = {
  'business-proposal': 'Create a business proposal for a document automation platform targeting enterprise clients. Focus on ROI and efficiency gains.',
  'investment-proposal': 'Create an investment proposal based on the TechCorp pitch deck, highlighting the market opportunity and growth potential.',
  'service-contract': 'Create a software development service agreement similar to the DevStudio contract, customized for a mobile app development project.',
  'status-report': 'Create a project status report following the format of the Q4 status report, for a new product launch initiative.',
};
