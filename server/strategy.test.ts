import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import express from 'express';
import {
  buildBusinessModelPrompt,
  buildCompetitivePrompt,
  buildConsistencyValidationPrompt,
  buildExecutiveSummaryPrompt,
  buildFinancialFeasibilityPrompt,
  buildRoadmapPrompt,
  formatProjectContext,
} from './prompts.ts';
import { apiRouter } from './routes.ts';
import {
  competitiveOutputSchema,
  consistencyValidationOutputSchema,
  executiveSummaryOutputSchema,
  financialFeasibilityOutputSchema,
  roadmapOutputSchema,
} from './schemas.ts';
import type { StrategyProject } from '../src/types/strategy.ts';

function buildFreshRouteSampleProject(): StrategyProject {
  const now = '2026-11-18T00:00:00.000Z';
  return {
    id: 'test-freshroute',
    isDemo: false,
    createdAt: now,
    updatedAt: now,
    status: 'In Progress',
    clarificationsSubmitted: true,
    intake: {
      businessName: 'FreshRoute Produce Exchange',
      businessDescription:
        'B2B farm-to-kitchen marketplace connecting local organic growers with independent restaurants and grocers.',
      industry: 'AgTech & B2B Food Logistics',
      targetGeography: 'Austin Metro Area',
      intendedCustomers: 'Independent restaurants and regional specialty grocers',
      estimatedStartingBudget: '$40,000',
      businessStage: 'Pre-Seed / Validation',
      mainObjective: 'Validate reliable weekly B2B produce fulfillment with 15 restaurants.',
    },
    additionalClarificationNotes: [
      'Proposed pricing is an unvalidated 10% commission on wholesale produce orders.',
      'Strictly prioritize B2B restaurant fulfillment before considering any B2C consumer box.',
    ],
    ideaAnalysis: {
      analyzedAt: now,
      coreValueProposition: 'Direct farm-to-restaurant ordering and consolidated cold delivery.',
      suppliedFactsSummary: ['Budget is $40,000 in Austin Metro Area.'],
      targetMarketAssumptions: [
        { statement: 'Restaurants will switch from broadline distributors.', basis: 'hypothesis' },
      ],
      potentialCustomerProblems: [
        { statement: 'Inconsistent farm availability and fragmented invoicing.', basis: 'hypothesis' },
      ],
      missingInformation: ['Cold van lease quotes', 'Average order size'],
      clarificationQuestions: [
        {
          id: 'cq-1',
          category: 'Economics',
          question: 'What commission or fee structure will you charge?',
          whyItMatters: 'Determines unit revenue.',
          answer: '10% commission on gross order value (proposed, unvalidated).',
        },
        {
          id: 'cq-2',
          category: 'Priority',
          question: 'Are you launching B2B and B2C simultaneously?',
          whyItMatters: 'Budget allocation.',
          answer: 'B2B first only; B2C only after B2B unit economics are proven.',
        },
      ],
      keyBusinessRisks: [
        { statement: '10% commission may not cover cold-chain delivery labor.', basis: 'hypothesis' },
      ],
    },
    manualCompetitors: [
      {
        id: 'comp-1',
        name: 'Sysco Regional Broadline',
        offeringSummary: 'Full-line foodservice distributor',
        pricingModel: 'Wholesale markup',
        perceivedStrengths: 'Scale and daily routes',
        perceivedWeaknesses: 'Less local farm transparency',
      },
    ],
  };
}

test('Exact Input Preservation: formatProjectContext and prompts preserve verbatim clarification answers and notes', () => {
  const project = buildFreshRouteSampleProject();
  const context = formatProjectContext(project);

  assert.match(context, /10% commission on gross order value \(proposed, unvalidated\)\./);
  assert.match(context, /B2B first only; B2C only after B2B unit economics are proven\./);
  assert.match(context, /Proposed pricing is an unvalidated 10% commission on wholesale produce orders\./);
  assert.match(context, /Strictly prioritize B2B restaurant fulfillment before considering any B2C consumer box\./);

  const finPrompt = buildFinancialFeasibilityPrompt(project);
  const bmPrompt = buildBusinessModelPrompt(project);
  const roadmapPrompt = buildRoadmapPrompt(project);
  const competitivePrompt = buildCompetitivePrompt(project);
  const consistencyPrompt = buildConsistencyValidationPrompt(project);
  const execPrompt = buildExecutiveSummaryPrompt(project);

  for (const tpl of [finPrompt, bmPrompt, roadmapPrompt, competitivePrompt, consistencyPrompt, execPrompt]) {
    assert.ok(tpl.prompt.includes('10% commission'), 'Downstream prompt must preserve exact 10% commission text');
    assert.ok(
      tpl.systemInstruction.includes('EXACT INPUT PRESERVATION'),
      'System instruction must enforce exact input preservation'
    );
  }
});

test('Financial Feasibility schema accepts explicit unknown values and preserved unvalidated rates', () => {
  const sample = {
    sufficiencyAssessment: {
      status: 'insufficient',
      summary: 'Supplier quotes, delivery van lease terms, and average order value are missing.',
      missingFinancialInputs: ['Average wholesale order value', 'Refrigerated van cost per mile'],
    },
    initialCapitalAllocation: [
      {
        id: 'cap-1',
        item: 'Starting Capital Cap',
        amount: '$40,000',
        cadenceOrUnit: 'One-time envelope',
        basis: 'fact',
        rationale: 'Supplied in business intake.',
      },
    ],
    fixedCosts: [
      {
        id: 'fc-1',
        item: 'Cold Storage Bay Lease',
        amount: 'Unknown',
        cadenceOrUnit: 'Monthly',
        basis: 'unknown',
        rationale: 'No Austin warehouse quote supplied.',
      },
    ],
    variableCosts: [
      {
        id: 'vc-1',
        item: 'Payment Processing Fee',
        amount: '~2.9% + $0.30',
        cadenceOrUnit: 'Per transaction',
        basis: 'estimate',
        rationale: 'Standard card processing benchmark.',
      },
    ],
    workingCapitalRequirements: {
      summary: 'Reserve buffer required for produce settlement timing.',
      estimatedBuffer: 'Unknown (pending average weekly GMV)',
      basis: 'unknown',
      assumptions: ['Farms paid net-7 while restaurants pay net-15'],
    },
    revenueModel: {
      description: '10% commission on wholesale produce orders (proposed, unvalidated).',
      preservedProposedRates: ['10% commission on gross order value'],
      basis: 'fact',
    },
    revenuePerTransaction: {
      valueOrFormula: '0.10 * Average Order Value (AOV unknown)',
      basis: 'unknown',
      rationale: 'Exact dollar revenue per order requires verified restaurant AOV.',
    },
    contributionMargin: {
      valueOrFormula: 'Unknown until delivery cost per drop is quoted',
      basis: 'unknown',
      rationale: 'Cannot verify if 10% commission yields positive unit margin.',
    },
    breakEvenAnalysis: {
      summary: 'Insufficient input data to calculate exact break-even order volume.',
      breakEvenThreshold: 'Unknown',
      basis: 'unknown',
      requiredInputsToCalculate: ['Average order value', 'Fixed monthly rent', 'Delivery cost per drop'],
    },
    scenarioAnalysis: [
      {
        scenarioName: 'Conservative',
        assumptions: ['8 active restaurants'],
        projectedOutcome: 'Revenue and margin remain bounded until AOV is confirmed.',
        basis: 'unknown',
        feasibilityNote: 'Requires AOV > $350 to keep fulfillment viable at 10% commission.',
      },
      {
        scenarioName: 'Base',
        assumptions: ['15 active restaurants'],
        projectedOutcome: 'Targets initial validation goal if delivery batching is dense.',
        basis: 'estimate',
        feasibilityNote: 'Dependent on route clustering.',
      },
      {
        scenarioName: 'Upside',
        assumptions: ['25 active restaurants'],
        projectedOutcome: 'Supports dedicated courier route.',
        basis: 'estimate',
        feasibilityNote: 'Only pursues after Base unit margin > 0.',
      },
    ],
  };

  const parsed = financialFeasibilityOutputSchema.parse(sample);
  assert.equal(parsed.sufficiencyAssessment.status, 'insufficient');
  assert.equal(parsed.contributionMargin.basis, 'unknown');
  assert.equal(parsed.revenueModel.preservedProposedRates[0], '10% commission on gross order value');
});

test('Competitive Positioning, Conditional Roadmap, Consistency Validation, and Transparency Ledger schemas validate cleanly', () => {
  const competitive = competitiveOutputSchema.parse({
    verifiedExternalResearchConducted: false,
    dataSourceNotice: 'No external competitor research conducted; grounded in 1 user-supplied competitor.',
    positioningStatement: 'Local farm-direct B2B aggregation.',
    differentiationOpportunities: [
      {
        statement: 'Greater local farm provenance than Sysco Regional Broadline.',
        sourceType: 'user_supplied',
        basis: 'fact',
      },
      {
        statement: 'Direct scheduling tailored for small independent chefs.',
        sourceType: 'ai_hypothesis',
        basis: 'hypothesis',
      },
    ],
    potentialAdvantages: [
      {
        statement: 'Agile ordering workflow tailored to independent chefs.',
        sourceType: 'ai_hypothesis',
        basis: 'hypothesis',
      },
      {
        statement: 'Lower overhead than broadline truck fleets.',
        sourceType: 'user_supplied',
        basis: 'fact',
      },
    ],
    potentialWeaknesses: [
      {
        statement: 'Lower route density at launch.',
        sourceType: 'ai_hypothesis',
        basis: 'hypothesis',
      },
      {
        statement: 'Narrower SKU catalog than full-line broadliners.',
        sourceType: 'user_supplied',
        basis: 'fact',
      },
    ],
    competitiveRisks: [
      {
        statement: 'Incumbent broadliners matching local sourcing SKUs.',
        sourceType: 'ai_hypothesis',
        basis: 'hypothesis',
      },
      {
        statement: 'Farms selling direct to restaurants outside the platform.',
        sourceType: 'ai_hypothesis',
        basis: 'hypothesis',
      },
    ],
  });
  assert.equal(competitive.verifiedExternalResearchConducted, false);

  const makePhase = (
    phaseKey: 'initial_validation' | 'planning_preparation' | 'launch' | 'growth',
    phaseTitle: string,
    timeframe: string,
    condition: string,
    targetMilestone: string,
    metricThreshold: string
  ) => ({
    phaseKey,
    phaseTitle,
    timeframe,
    entryConditions: [`Prerequisites met for ${phaseTitle}`],
    conditionalTriggers: [{ condition, targetMilestone, metricThreshold }],
    objectives: [`Primary objective for ${phaseTitle}`, `Secondary objective for ${phaseTitle}`],
    activities: [`Core activity 1 for ${phaseTitle}`, `Core activity 2 for ${phaseTitle}`],
    deliverables: [`Deliverable 1 for ${phaseTitle}`, `Deliverable 2 for ${phaseTitle}`],
    dependencies: [`Dependency for ${phaseTitle}`],
    successIndicators: [`KPI 1 for ${phaseTitle}`, `KPI 2 for ${phaseTitle}`],
  });

  const roadmap = roadmapOutputSchema.parse({
    phases: [
      makePhase(
        'initial_validation',
        'Initial Validation',
        'Weeks 1–4',
        '10 B2B restaurant LOIs signed',
        'Begin pilot delivery wave',
        '>= 10 LOIs'
      ),
      makePhase(
        'planning_preparation',
        'Planning & Preparation',
        'Weeks 5–8',
        'Courier quote leaves positive unit margin',
        'Lock courier contract',
        'Margin > $0 per drop'
      ),
      makePhase(
        'launch',
        'Launch',
        'Weeks 9–16',
        '15 B2B accounts achieve positive contribution margin and repeat orders',
        'Evaluate optional B2C expansion pilot',
        '>= 95% on-time + >= 60% 4-week repeat + positive contribution margin'
      ),
      makePhase(
        'growth',
        'Growth',
        'Months 5–6',
        'Sustained positive cash flow on Austin B2B routes',
        'Expand secondary customer tier',
        'Contribution margin >= 15%'
      ),
    ],
  });
  assert.equal(roadmap.phases.length, 4);

  const consistency = consistencyValidationOutputSchema.parse({
    overallStatus: 'warnings_detected',
    summary: '10% commission preserved, but unit margin remains unverified.',
    checks: [
      {
        id: 'chk-1',
        category: 'revenue_model',
        severity: 'warning',
        title: '10% commission unvalidated against delivery cost',
        description: 'Commission rate is preserved from user input but courier cost is unknown.',
        affectedModules: ['Financial Feasibility', 'Business Model'],
        resolutionGuidance: 'Obtain courier quotes before pilot launch.',
      },
      {
        id: 'chk-2',
        category: 'customer_priority',
        severity: 'aligned',
        title: 'B2B restaurant priority consistent across roadmap and personas',
        description: 'B2C remains gated behind B2B unit economics.',
        affectedModules: ['Personas', 'Roadmap'],
        resolutionGuidance: 'Maintain B2B focus until Phase 3 KPIs pass.',
      },
      {
        id: 'chk-3',
        category: 'budget',
        severity: 'warning',
        title: '$40,000 budget limits custom cold fleet CapEx',
        description: 'Requires contracted courier or asset-light routing.',
        affectedModules: ['Financial Feasibility', 'Roadmap'],
        resolutionGuidance: 'Avoid vehicle purchase commitments in Phase 1.',
      },
    ],
  });
  assert.equal(consistency.checks[0].category, 'revenue_model');

  const exec = executiveSummaryOutputSchema.parse({
    strategicThesis: 'B2B-first farm-to-restaurant consolidation.',
    executiveSummary: 'Structured summary grounded in intake facts and explicit validation gates.',
    criticalRisksAndAssumptions: [
      { statement: '10% commission covers delivery cost.', basis: 'hypothesis' },
      { statement: '$40,000 starting budget requires asset-light fulfillment.', basis: 'fact' },
    ],
    recommendedNextSteps: [
      { action: 'Get cold courier quotes', priority: 'Immediate', ownerFocus: 'Operations' },
      { action: 'Sign 10 B2B restaurant LOIs', priority: 'Immediate', ownerFocus: 'Sales' },
      { action: 'Run 3 dry-run delivery waves', priority: 'Near-Term', ownerFocus: 'Fulfillment' },
    ],
    transparencyLedger: {
      confirmedInputs: ['Starting budget is $40,000', 'Proposed 10% commission rate'],
      unvalidatedAssumptions: ['10% commission yields positive contribution margin'],
      recommendations: ['Gate B2C expansion behind B2B profitability'],
      missingInformation: ['Cold van lease quotes'],
      decisionsRequiringHumanValidation: ['Approve minimum order value threshold'],
    },
  });
  assert.equal(exec.transparencyLedger.confirmedInputs.length, 2);
});

test('REST API persists FreshRoute intake, additionalClarificationNotes, and serves enriched demo project', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  let createdId: string | null = null;
  try {
    // 1. Verify existing demo project normalizes cleanly with all new fields
    const listRes = await fetch(`${baseUrl}/projects`);
    assert.equal(listRes.status, 200);
    const listJson = (await listRes.json()) as { projects: StrategyProject[] };
    const demo = listJson.projects.find((p) => p.id === 'demo-meridian-coldchain');
    assert.ok(demo, 'Demo project must exist');
    assert.ok(demo.financialFeasibility, 'Demo project must include financialFeasibility');
    assert.equal(demo.competitivePositioning?.verifiedExternalResearchConducted, false);
    assert.ok(demo.roadmap?.phases[0]?.conditionalTriggers?.length);
    assert.ok(demo.consistencyValidation);
    assert.ok(demo.executiveReport?.transparencyLedger);

    // 2. Create a FreshRoute test project and verify exact preservation on PATCH
    const createRes = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildFreshRouteSampleProject().intake),
    });
    assert.equal(createRes.status, 201);
    const createJson = (await createRes.json()) as { project: StrategyProject };
    createdId = createJson.project.id;

    const patchRes = await fetch(`${baseUrl}/projects/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        additionalClarificationNotes: [
          'Proposed 10% commission model (unvalidated)',
          'B2B before B2C',
        ],
      }),
    });
    assert.equal(patchRes.status, 200);
    const patchJson = (await patchRes.json()) as { project: StrategyProject };
    assert.deepEqual(patchJson.project.additionalClarificationNotes, [
      'Proposed 10% commission model (unvalidated)',
      'B2B before B2C',
    ]);
  } finally {
    if (createdId) {
      await fetch(`${baseUrl}/projects/${createdId}`, { method: 'DELETE' });
    }
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
