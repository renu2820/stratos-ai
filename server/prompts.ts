import { Type, type Schema } from '@google/genai';
import type { StrategyProject } from '../src/types/strategy.ts';

const GROUNDING_SYSTEM_RULE = `You are a senior strategy consultant powering STRATOS AI.
Strict Epistemic & Exact Input Preservation Rules:
1. EXACT INPUT PRESERVATION: Preserve every user-supplied number, percentage, commission rate (e.g., "10% commission"), price point, budget figure, customer priority (e.g., B2B before B2C), and clarification answer VERBATIM in downstream analysis. Never replace a founder's stated revenue mechanism with a generic alternative.
2. UNVALIDATED FOUNDER PROPOSALS: Proposed rates, pricing, or commissions supplied by the user (e.g., a proposed 10% commission) MUST be retained accurately and classified as unvalidated business assumptions (basis: "hypothesis") until validated with real customer/market testing.
3. EPISTEMIC SEPARATION: Clearly distinguish SUPPLIED FACTS (basis: "fact"), AI-GENERATED HYPOTHESES / ESTIMATES (basis: "hypothesis" or "estimate"), RECOMMENDATIONS (basis: "recommendation"), and UNKNOWN DATA (basis: "unknown").
4. ZERO FABRICATION: Never invent external market research statistics, TAM/SAM/SOM dollar figures, supplier quotes, verified financial results, or real-world competitor data. When data is missing, explicitly mark it as missing/unknown.
5. Keep prose crisp, analytical, executive-ready, and free of buzzword fluff. Respect the JSON schema strictly.`;

export function formatProjectContext(project: StrategyProject): string {
  const {
    intake,
    ideaAnalysis,
    additionalClarificationNotes,
    personas,
    swot,
    businessModel,
    financialFeasibility,
    manualCompetitors,
    competitivePositioning,
    roadmap,
    consistencyValidation,
  } = project;

  const lines: string[] = [
    '=== VERBATIM SUPPLIED BUSINESS INTAKE (SOURCE OF TRUTH) ===',
    `Business Name: ${intake.businessName}`,
    `Business Description: ${intake.businessDescription}`,
    `Industry: ${intake.industry}`,
    `Target Geography: ${intake.targetGeography}`,
    `Intended Customers: ${intake.intendedCustomers}`,
    `Estimated Starting Budget: ${intake.estimatedStartingBudget}`,
    `Business Stage: ${intake.businessStage}`,
    `Main Business Objective: ${intake.mainObjective}`,
  ];

  if (ideaAnalysis?.clarificationQuestions?.length) {
    const answered = ideaAnalysis.clarificationQuestions.filter(
      (q) => q.answer && q.answer.trim().length > 0
    );
    if (answered.length > 0) {
      lines.push('\n=== VERBATIM FOUNDER CLARIFICATION ANSWERS (MUST PRESERVE EXACT VALUES) ===');
      for (const q of answered) {
        lines.push(`Q [${q.category}]: ${q.question}`);
        lines.push(`Founder Answer (Exact): ${q.answer.trim()}`);
      }
    }
  }

  if (additionalClarificationNotes && additionalClarificationNotes.length > 0) {
    lines.push('\n=== ADDITIONAL FOUNDER CLARIFICATION NOTES (VERBATIM) ===');
    for (const note of additionalClarificationNotes) {
      lines.push(`- ${note}`);
    }
  }

  if (ideaAnalysis) {
    lines.push('\n=== IDEA ANALYSIS DIAGNOSTIC ===');
    lines.push(`Core Value Proposition: ${ideaAnalysis.coreValueProposition}`);
    if (ideaAnalysis.suppliedFactsSummary.length > 0) {
      lines.push(`Confirmed Facts: ${ideaAnalysis.suppliedFactsSummary.join(' | ')}`);
    }
    if (ideaAnalysis.missingInformation.length > 0) {
      lines.push(`Missing Information: ${ideaAnalysis.missingInformation.join(' | ')}`);
    }
  }

  if (personas?.items?.length) {
    lines.push('\n=== GENERATED CUSTOMER PERSONAS ===');
    for (const p of personas.items) {
      lines.push(
        `- ${p.personaName} (${p.roleOrArchetype}): ${p.demographics.summary} | Goals: ${p.goals
          .map((g) => g.text)
          .join('; ')}`
      );
    }
  }

  if (swot) {
    lines.push('\n=== SWOT HIGHLIGHTS ===');
    lines.push(`Strengths: ${swot.strengths.map((s) => `${s.point} [${s.basis}]`).join('; ')}`);
    lines.push(`Weaknesses: ${swot.weaknesses.map((w) => `${w.point} [${w.basis}]`).join('; ')}`);
    lines.push(`Opportunities: ${swot.opportunities.map((o) => `${o.point} [${o.basis}]`).join('; ')}`);
    lines.push(`Threats: ${swot.threats.map((t) => `${t.point} [${t.basis}]`).join('; ')}`);
  }

  if (businessModel) {
    lines.push('\n=== BUSINESS MODEL HIGHLIGHTS ===');
    lines.push(`Value Proposition: ${businessModel.valueProposition.map((i) => i.text).join('; ')}`);
    lines.push(`Customer Segments: ${businessModel.customerSegments.map((i) => i.text).join('; ')}`);
    lines.push(`Revenue Streams: ${businessModel.revenueStreams.map((i) => i.text).join('; ')}`);
    lines.push(`Cost Structure: ${businessModel.costStructure.map((i) => i.text).join('; ')}`);
    lines.push(`Distribution Channels: ${businessModel.distributionChannels.map((i) => i.text).join('; ')}`);
  }

  if (financialFeasibility) {
    lines.push('\n=== FINANCIAL FEASIBILITY SUMMARY ===');
    lines.push(
      `Data Sufficiency: ${financialFeasibility.sufficiencyAssessment.status} — ${financialFeasibility.sufficiencyAssessment.summary}`
    );
    lines.push(
      `Revenue Model: ${financialFeasibility.revenueModel.description} | Preserved Rates: ${financialFeasibility.revenueModel.preservedProposedRates.join(', ') || 'None'}`
    );
    lines.push(
      `Revenue per Transaction: ${financialFeasibility.revenuePerTransaction.valueOrFormula} [${financialFeasibility.revenuePerTransaction.basis}]`
    );
    lines.push(
      `Contribution Margin: ${financialFeasibility.contributionMargin.valueOrFormula} [${financialFeasibility.contributionMargin.basis}]`
    );
    lines.push(
      `Break-Even: ${financialFeasibility.breakEvenAnalysis.breakEvenThreshold} [${financialFeasibility.breakEvenAnalysis.basis}]`
    );
  }

  if (manualCompetitors.length > 0) {
    lines.push('\n=== USER-SUPPLIED COMPETITORS (ONLY COMPETITOR DATA AVAILABLE) ===');
    for (const c of manualCompetitors) {
      lines.push(
        `- ${c.name} | Offering: ${c.offeringSummary} | Pricing: ${c.pricingModel} | Strengths: ${c.perceivedStrengths} | Weaknesses: ${c.perceivedWeaknesses}`
      );
    }
  }

  if (competitivePositioning) {
    lines.push('\n=== COMPETITIVE POSITIONING ===');
    lines.push(`Verified External Research Conducted: ${competitivePositioning.verifiedExternalResearchConducted}`);
    lines.push(`Positioning Statement: ${competitivePositioning.positioningStatement}`);
  }

  if (roadmap) {
    lines.push('\n=== STRATEGIC ROADMAP PHASES ===');
    for (const ph of roadmap.phases) {
      lines.push(
        `- ${ph.phaseTitle} (${ph.timeframe}) | Entry Conditions: ${ph.entryConditions.join('; ')} | Objectives: ${ph.objectives.join('; ')}`
      );
    }
  }

  if (consistencyValidation) {
    lines.push('\n=== CONSISTENCY AUDIT RESULTS ===');
    lines.push(`Overall Status: ${consistencyValidation.overallStatus} — ${consistencyValidation.summary}`);
    for (const chk of consistencyValidation.checks) {
      lines.push(`- [${chk.severity.toUpperCase()} / ${chk.category}] ${chk.title}: ${chk.description}`);
    }
  }

  return lines.join('\n');
}

const epistemicItemResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    statement: { type: Type.STRING },
    basis: { type: Type.STRING, enum: ['fact', 'hypothesis', 'recommendation'] },
    rationale: { type: Type.STRING },
  },
  required: ['statement', 'basis'],
};

export function buildIdeaAnalysisPrompt(project: StrategyProject, additionalNotes?: string) {
  const context = formatProjectContext(project);
  const notesSection = additionalNotes?.trim()
    ? `\n=== NEWLY SUBMITTED ADDITIONAL USER NOTES ===\n${additionalNotes.trim()}`
    : '';

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Idea Analysis:
- Identify the core value proposition based strictly on the user's description and clarification answers.
- Summarize explicitly supplied facts verbatim separately from target market assumptions.
- If the founder specified exact pricing, commission rates (e.g. 10% commission), or customer sequencing in intake or clarifications, preserve those exact figures and classify unvalidated business choices as "hypothesis".
- Identify potential customer problems, missing strategic information, and key business risks.
- Generate 3 to 5 targeted, high-leverage clarification questions covering unit economics, pricing/commission structure, customer acquisition, operational constraints, or segment priority.`,
    prompt: `Analyze the following early-stage business submission and produce a structured diagnostic.\n\n${context}${notesSection}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        coreValueProposition: { type: Type.STRING },
        suppliedFactsSummary: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        targetMarketAssumptions: {
          type: Type.ARRAY,
          items: epistemicItemResponseSchema,
        },
        potentialCustomerProblems: {
          type: Type.ARRAY,
          items: epistemicItemResponseSchema,
        },
        missingInformation: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        clarificationQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              whyItMatters: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ['id', 'question', 'whyItMatters', 'category'],
          },
        },
        keyBusinessRisks: {
          type: Type.ARRAY,
          items: epistemicItemResponseSchema,
        },
      },
      required: [
        'coreValueProposition',
        'suppliedFactsSummary',
        'targetMarketAssumptions',
        'potentialCustomerProblems',
        'missingInformation',
        'clarificationQuestions',
        'keyBusinessRisks',
      ],
    } satisfies Schema,
  };
}

export function buildPersonasPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);
  const traitListSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING },
        basis: { type: Type.STRING, enum: ['fact', 'hypothesis'] },
      },
      required: ['text', 'basis'],
    },
  };

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Customer Persona Generation:
- Respect the exact customer segment priority and geography stated in the intake and clarification answers (e.g., if B2B buyers are prioritized before B2C, primary personas must reflect B2B decision-makers).
- Preserve exact pricing/commission parameters when describing purchasing motivations.
- Only include demographics that are relevant and supported; mark inferred characteristics explicitly with basis: "hypothesis", and traits directly stated by the user with basis: "fact".`,
    prompt: `Generate 2 to 3 structured customer personas for this business strategy project.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        personas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              personaName: { type: Type.STRING },
              roleOrArchetype: { type: Type.STRING },
              demographics: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  basis: { type: Type.STRING, enum: ['fact', 'hypothesis'] },
                },
                required: ['summary', 'basis'],
              },
              goals: traitListSchema,
              painPoints: traitListSchema,
              purchasingMotivations: traitListSchema,
              expectedBehavior: traitListSchema,
              customerNeeds: traitListSchema,
            },
            required: [
              'id',
              'personaName',
              'roleOrArchetype',
              'demographics',
              'goals',
              'painPoints',
              'purchasingMotivations',
              'expectedBehavior',
              'customerNeeds',
            ],
          },
        },
      },
      required: ['personas'],
    } satisfies Schema,
  };
}

export function buildSwotPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);
  const swotListSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        point: { type: Type.STRING },
        rationale: { type: Type.STRING },
        basis: { type: Type.STRING, enum: ['fact', 'hypothesis'] },
        impact: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
      },
      required: ['id', 'point', 'rationale', 'basis', 'impact'],
    },
  };

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For SWOT Analysis:
- Generate 3 to 4 concrete points per quadrant (Strengths, Weaknesses, Opportunities, Threats).
- Every point MUST include a concise rationale and explicitly indicate whether it is grounded in a user-supplied "fact" or an AI-generated "hypothesis".
- Preserve exact budget limits and proposed revenue mechanics from clarifications rather than inventing alternatives.`,
    prompt: `Generate a structured SWOT analysis with rationales for this business.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        strengths: swotListSchema,
        weaknesses: swotListSchema,
        opportunities: swotListSchema,
        threats: swotListSchema,
      },
      required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
    } satisfies Schema,
  };
}

export function buildBusinessModelPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);
  const blockSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        text: { type: Type.STRING },
        basis: { type: Type.STRING, enum: ['fact', 'hypothesis', 'recommendation'] },
      },
      required: ['id', 'text', 'basis'],
    },
  };

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Business Model Design:
- Populate all 8 structural blocks: Value Proposition, Customer Segments, Revenue Streams, Key Resources, Key Activities, Cost Structure, Distribution Channels, Customer Relationships.
- CRITICAL: If the user specified a revenue model or rate (such as "10% commission" or specific retainer/fee) in intake or clarification answers, you MUST preserve that exact model and rate in Revenue Streams and classify it as basis: "hypothesis" (unvalidated business assumption) — NEVER silently replace it with a generic subscription or different percentage.
- Respect user-stated customer segment sequencing (e.g., primary B2B focus before secondary expansion).`,
    prompt: `Design a structured Business Model Canvas for this venture.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        valueProposition: blockSchema,
        customerSegments: blockSchema,
        revenueStreams: blockSchema,
        keyResources: blockSchema,
        keyActivities: blockSchema,
        costStructure: blockSchema,
        distributionChannels: blockSchema,
        customerRelationships: blockSchema,
      },
      required: [
        'valueProposition',
        'customerSegments',
        'revenueStreams',
        'keyResources',
        'keyActivities',
        'costStructure',
        'distributionChannels',
        'customerRelationships',
      ],
    } satisfies Schema,
  };
}

export function buildFinancialFeasibilityPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);

  const lineItemSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      item: { type: Type.STRING },
      amount: { type: Type.STRING },
      cadenceOrUnit: { type: Type.STRING },
      basis: { type: Type.STRING, enum: ['fact', 'estimate', 'unknown'] },
      rationale: { type: Type.STRING },
    },
    required: ['id', 'item', 'amount', 'cadenceOrUnit', 'basis', 'rationale'],
  };

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Financial Feasibility Analysis:
- Analyze: Initial Capital Allocation (anchored strictly to the user's Estimated Starting Budget), Fixed Costs, Variable Costs, Working Capital Requirements, Revenue Model, Revenue per Transaction, Contribution Margin, Break-Even Analysis, and 3-Scenario Analysis (Conservative, Base, Upside).
- STRICT EPISTEMIC CLASSIFICATION:
  - basis: "fact" ONLY for numbers/budgets/rates explicitly provided by the user.
  - basis: "estimate" for directional AI-generated structural estimates or formulas.
  - basis: "unknown" whenever reliable calculation is impossible without missing inputs (e.g. unknown average order value, unknown supplier COGS, unknown delivery cost per stop).
- NEVER invent actual supplier quotations, market prices, or verified financial results.
- Preserve exact proposed revenue rates (e.g. "10% commission") in revenueModel.preservedProposedRates and classify the revenue model as "hypothesis" if untested.
- If key unit-economic inputs are missing, honestly set sufficiencyAssessment.status to "partial" or "insufficient", list exact missingFinancialInputs, and mark uncalculable metrics (such as breakEvenThreshold or contributionMargin) as "unknown" with formulas/required inputs instead of fabricated dollar profits.`,
    prompt: `Perform a disciplined, transparent Financial Feasibility Analysis for this venture.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        sufficiencyAssessment: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['sufficient', 'partial', 'insufficient'] },
            summary: { type: Type.STRING },
            missingFinancialInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['status', 'summary', 'missingFinancialInputs'],
        },
        initialCapitalAllocation: { type: Type.ARRAY, items: lineItemSchema },
        fixedCosts: { type: Type.ARRAY, items: lineItemSchema },
        variableCosts: { type: Type.ARRAY, items: lineItemSchema },
        workingCapitalRequirements: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            estimatedBuffer: { type: Type.STRING },
            basis: { type: Type.STRING, enum: ['fact', 'estimate', 'unknown'] },
            assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['summary', 'estimatedBuffer', 'basis', 'assumptions'],
        },
        revenueModel: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            preservedProposedRates: { type: Type.ARRAY, items: { type: Type.STRING } },
            basis: { type: Type.STRING, enum: ['fact', 'hypothesis', 'estimate'] },
          },
          required: ['description', 'preservedProposedRates', 'basis'],
        },
        revenuePerTransaction: {
          type: Type.OBJECT,
          properties: {
            valueOrFormula: { type: Type.STRING },
            basis: { type: Type.STRING, enum: ['fact', 'estimate', 'unknown'] },
            rationale: { type: Type.STRING },
          },
          required: ['valueOrFormula', 'basis', 'rationale'],
        },
        contributionMargin: {
          type: Type.OBJECT,
          properties: {
            valueOrFormula: { type: Type.STRING },
            basis: { type: Type.STRING, enum: ['fact', 'estimate', 'unknown'] },
            rationale: { type: Type.STRING },
          },
          required: ['valueOrFormula', 'basis', 'rationale'],
        },
        breakEvenAnalysis: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            breakEvenThreshold: { type: Type.STRING },
            basis: { type: Type.STRING, enum: ['fact', 'estimate', 'unknown'] },
            requiredInputsToCalculate: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['summary', 'breakEvenThreshold', 'basis', 'requiredInputsToCalculate'],
        },
        scenarioAnalysis: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              scenarioName: { type: Type.STRING, enum: ['Conservative', 'Base', 'Upside'] },
              assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              projectedOutcome: { type: Type.STRING },
              basis: { type: Type.STRING, enum: ['estimate', 'unknown'] },
              feasibilityNote: { type: Type.STRING },
            },
            required: [
              'scenarioName',
              'assumptions',
              'projectedOutcome',
              'basis',
              'feasibilityNote',
            ],
          },
        },
      },
      required: [
        'sufficiencyAssessment',
        'initialCapitalAllocation',
        'fixedCosts',
        'variableCosts',
        'workingCapitalRequirements',
        'revenueModel',
        'revenuePerTransaction',
        'contributionMargin',
        'breakEvenAnalysis',
        'scenarioAnalysis',
      ],
    } satisfies Schema,
  };
}

export function buildCompetitivePrompt(project: StrategyProject) {
  const context = formatProjectContext(project);
  const hasCompetitors = project.manualCompetitors.length > 0;

  const competitiveInsightSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      statement: { type: Type.STRING },
      sourceType: {
        type: Type.STRING,
        enum: ['user_supplied', 'verified_external', 'ai_hypothesis'],
      },
      basis: { type: Type.STRING, enum: ['fact', 'hypothesis', 'recommendation'] },
      rationale: { type: Type.STRING },
    },
    required: ['statement', 'sourceType', 'basis'],
  };

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
CRITICAL COMPETITIVE INTEGRITY & SOURCE CLASSIFICATION RULE:
- No external web-search or market database integration is connected in this request. Therefore, verifiedExternalResearchConducted MUST be false, and you MUST NEVER use sourceType "verified_external".
- NEVER invent real-world competitor names, market shares, pricing, or claim that competitor research was conducted when no external sources were retrieved.
- Classify every point strictly as:
  - sourceType: "user_supplied" ONLY when directly citing facts from the user's manual competitor entries or intake.
  - sourceType: "ai_hypothesis" for all inferred positioning, differentiation, advantage, weakness, or risk hypotheses.
- ${
      hasCompetitors
        ? 'Base competitor comparisons strictly on the user-supplied competitor entries below.'
        : 'The user has NOT supplied any competitor entries yet. Do NOT invent or name any real companies. Provide structural positioning hypotheses based strictly on the venture description, and explicitly state in dataSourceNotice that no user-supplied competitors or external sources were retrieved.'
    }`,
    prompt: `Analyze competitive positioning for this venture based strictly on the supplied context.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        verifiedExternalResearchConducted: { type: Type.BOOLEAN },
        dataSourceNotice: { type: Type.STRING },
        positioningStatement: { type: Type.STRING },
        differentiationOpportunities: {
          type: Type.ARRAY,
          items: competitiveInsightSchema,
        },
        potentialAdvantages: {
          type: Type.ARRAY,
          items: competitiveInsightSchema,
        },
        potentialWeaknesses: {
          type: Type.ARRAY,
          items: competitiveInsightSchema,
        },
        competitiveRisks: {
          type: Type.ARRAY,
          items: competitiveInsightSchema,
        },
      },
      required: [
        'verifiedExternalResearchConducted',
        'dataSourceNotice',
        'positioningStatement',
        'differentiationOpportunities',
        'potentialAdvantages',
        'potentialWeaknesses',
        'competitiveRisks',
      ],
    } satisfies Schema,
  };
}

export function buildRoadmapPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Conditional Strategic Roadmap:
- Produce exactly 4 sequential phases using these exact phaseKey values in order:
  1. "initial_validation" (Phase Title: "Initial Validation")
  2. "planning_preparation" (Phase Title: "Planning & Preparation")
  3. "launch" (Phase Title: "Launch")
  4. "growth" (Phase Title: "Growth")
- CONDITIONAL GATING REQUIREMENT:
  - Every phase MUST include explicit entryConditions (what measurable validation gates must pass before entering this phase) and conditionalTriggers (specific IF/THEN rules linking measurable metrics—such as reliable on-time deliveries, positive unit contribution margin, and repeat orders—to downstream expansion milestones).
  - If the venture includes staged market expansion (e.g., B2B operations first followed by B2C expansion), B2C or secondary expansion milestones MUST be explicitly conditional on validated primary operational KPIs (reliable deliveries, positive contribution margin, repeat customer orders)—never scheduled unconditionally by calendar date alone.
- Align activities and deliverables realistically to the user's estimated starting budget and current business stage.`,
    prompt: `Create a 4-phase conditional, KPI-gated strategic roadmap for this venture.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        phases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phaseKey: {
                type: Type.STRING,
                enum: ['initial_validation', 'planning_preparation', 'launch', 'growth'],
              },
              phaseTitle: { type: Type.STRING },
              timeframe: { type: Type.STRING },
              entryConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
              conditionalTriggers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    condition: { type: Type.STRING },
                    targetMilestone: { type: Type.STRING },
                    metricThreshold: { type: Type.STRING },
                  },
                  required: ['condition', 'targetMilestone', 'metricThreshold'],
                },
              },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
              activities: { type: Type.ARRAY, items: { type: Type.STRING } },
              deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
              dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              successIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'phaseKey',
              'phaseTitle',
              'timeframe',
              'entryConditions',
              'conditionalTriggers',
              'objectives',
              'activities',
              'deliverables',
              'dependencies',
              'successIndicators',
            ],
          },
        },
      },
      required: ['phases'],
    } satisfies Schema,
  };
}

export function buildConsistencyValidationPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Strategy Consistency Validation:
Compare ALL generated modules (Idea Analysis, Personas, SWOT, Business Model, Financial Feasibility, Competitive Positioning, Roadmap) against the original Business Intake and ALL Founder Clarification Answers & Notes.
Specifically inspect and produce checks across all 5 categories:
1. "revenue_model": Detect contradictory revenue models (e.g., if founder proposed a specific commission or fee such as 10% commission, did Business Model, Financial Feasibility, and Report preserve it accurately without substituting another model?).
2. "customer_priority": Detect conflicting customer priorities (e.g., if B2B was specified as primary before B2C, do Personas, Business Model, and Roadmap respect that sequence?).
3. "budget": Detect inconsistent budgets (do planned activities, capital allocations, and launch steps fit within Estimated Starting Budget?).
4. "timeline": Detect unrealistic timelines or un-gated expansion leaps that ignore validation dependencies.
5. "operational_assumption": Detect unsupported operational assumptions or unverified unit economics treated as fact.
Be rigorous and honest: flag real conflicts ("conflict") or gaps ("warning"), and mark verified alignment as "aligned".`,
    prompt: `Audit all modules of this strategy project for cross-module consistency against the verbatim intake and clarifications.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        overallStatus: {
          type: Type.STRING,
          enum: ['consistent', 'warnings_detected', 'conflicts_detected'],
        },
        summary: { type: Type.STRING },
        checks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: [
                  'revenue_model',
                  'customer_priority',
                  'budget',
                  'timeline',
                  'operational_assumption',
                ],
              },
              severity: { type: Type.STRING, enum: ['conflict', 'warning', 'aligned'] },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              affectedModules: { type: Type.ARRAY, items: { type: Type.STRING } },
              resolutionGuidance: { type: Type.STRING },
            },
            required: [
              'id',
              'category',
              'severity',
              'title',
              'description',
              'affectedModules',
              'resolutionGuidance',
            ],
          },
        },
      },
      required: ['overallStatus', 'summary', 'checks'],
    } satisfies Schema,
  };
}

export function buildExecutiveSummaryPrompt(project: StrategyProject) {
  const context = formatProjectContext(project);

  return {
    systemInstruction: `${GROUNDING_SYSTEM_RULE}
For Executive Strategy Synthesis & Report Transparency:
- Synthesize the completed strategy modules into an executive summary (2-3 crisp paragraphs), a single-sentence strategic thesis, critical risks & unvalidated assumptions, and prioritized recommended next steps.
- Preserve every exact user-supplied parameter (such as exact commission percentages, pricing models, and budgets) and explicitly frame user-proposed untested pricing/commission terms as unvalidated assumptions.
- Populate transparencyLedger completely with:
  - confirmedInputs: verbatim facts supplied in intake & clarifications
  - unvalidatedAssumptions: proposed pricing/commissions, market assumptions, and unverified operational hypotheses
  - recommendations: concrete strategic recommendations
  - missingInformation: unresolved information gaps & unknown financial inputs
  - decisionsRequiringHumanValidation: explicit founder sign-offs or real-world validations needed before committing capital.`,
    prompt: `Synthesize an executive strategy report and transparency ledger from the following project modules.\n\n${context}`,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        executiveSummary: { type: Type.STRING },
        strategicThesis: { type: Type.STRING },
        criticalRisksAndAssumptions: {
          type: Type.ARRAY,
          items: epistemicItemResponseSchema,
        },
        recommendedNextSteps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['Immediate', 'Near-Term', 'Medium-Term'] },
              ownerFocus: { type: Type.STRING },
            },
            required: ['action', 'priority', 'ownerFocus'],
          },
        },
        transparencyLedger: {
          type: Type.OBJECT,
          properties: {
            confirmedInputs: { type: Type.ARRAY, items: { type: Type.STRING } },
            unvalidatedAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingInformation: { type: Type.ARRAY, items: { type: Type.STRING } },
            decisionsRequiringHumanValidation: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'confirmedInputs',
            'unvalidatedAssumptions',
            'recommendations',
            'missingInformation',
            'decisionsRequiringHumanValidation',
          ],
        },
      },
      required: [
        'executiveSummary',
        'strategicThesis',
        'criticalRisksAndAssumptions',
        'recommendedNextSteps',
        'transparencyLedger',
      ],
    } satisfies Schema,
  };
}
