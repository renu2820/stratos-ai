import { z } from 'zod';

export const businessIntakeSchema = z.object({
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(120),
  businessDescription: z
    .string()
    .trim()
    .min(20, 'Please provide at least 20 characters describing the business idea')
    .max(4000),
  industry: z.string().trim().min(2, 'Industry is required').max(120),
  targetGeography: z.string().trim().min(2, 'Target geography is required').max(160),
  intendedCustomers: z.string().trim().min(5, 'Intended customers description is required').max(600),
  estimatedStartingBudget: z.string().trim().min(1, 'Estimated starting budget is required').max(120),
  businessStage: z.string().trim().min(2, 'Business stage is required').max(80),
  mainObjective: z.string().trim().min(5, 'Main business objective is required').max(600),
});

export const epistemicItemSchema = z.object({
  statement: z.string().min(1),
  basis: z.enum(['fact', 'hypothesis', 'recommendation']),
  rationale: z.string().optional(),
});

export const ideaAnalysisOutputSchema = z.object({
  coreValueProposition: z.string().min(1),
  suppliedFactsSummary: z.array(z.string().min(1)).min(1),
  targetMarketAssumptions: z.array(epistemicItemSchema).min(1),
  potentialCustomerProblems: z.array(epistemicItemSchema).min(1),
  missingInformation: z.array(z.string().min(1)),
  clarificationQuestions: z
    .array(
      z.object({
        id: z.string().min(1),
        question: z.string().min(1),
        whyItMatters: z.string().min(1),
        category: z.string().min(1),
      })
    )
    .min(2)
    .max(6),
  keyBusinessRisks: z.array(epistemicItemSchema).min(1),
});

export const clarificationAnswersSchema = z.object({
  answers: z.array(
    z.object({
      id: z.string().min(1),
      answer: z.string().trim().max(2000),
    })
  ),
  additionalNotes: z.string().trim().max(3000).optional(),
});

const personaTraitSchema = z.object({
  text: z.string().min(1),
  basis: z.enum(['fact', 'hypothesis']),
});

export const personasOutputSchema = z.object({
  personas: z
    .array(
      z.object({
        id: z.string().min(1),
        personaName: z.string().min(1),
        roleOrArchetype: z.string().min(1),
        demographics: z.object({
          summary: z.string().min(1),
          basis: z.enum(['fact', 'hypothesis']),
        }),
        goals: z.array(personaTraitSchema).min(2),
        painPoints: z.array(personaTraitSchema).min(2),
        purchasingMotivations: z.array(personaTraitSchema).min(2),
        expectedBehavior: z.array(personaTraitSchema).min(2),
        customerNeeds: z.array(personaTraitSchema).min(2),
      })
    )
    .min(2)
    .max(4),
});

const swotEntrySchema = z.object({
  id: z.string().min(1),
  point: z.string().min(1),
  rationale: z.string().min(1),
  basis: z.enum(['fact', 'hypothesis']),
  impact: z.enum(['high', 'medium', 'low']),
});

export const swotOutputSchema = z.object({
  strengths: z.array(swotEntrySchema).min(2),
  weaknesses: z.array(swotEntrySchema).min(2),
  opportunities: z.array(swotEntrySchema).min(2),
  threats: z.array(swotEntrySchema).min(2),
});

const bmItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  basis: z.enum(['fact', 'hypothesis', 'recommendation']),
});

export const businessModelOutputSchema = z.object({
  valueProposition: z.array(bmItemSchema).min(1),
  customerSegments: z.array(bmItemSchema).min(1),
  revenueStreams: z.array(bmItemSchema).min(1),
  keyResources: z.array(bmItemSchema).min(1),
  keyActivities: z.array(bmItemSchema).min(1),
  costStructure: z.array(bmItemSchema).min(1),
  distributionChannels: z.array(bmItemSchema).min(1),
  customerRelationships: z.array(bmItemSchema).min(1),
});

const financialLineItemSchema = z.object({
  id: z.string().min(1),
  item: z.string().min(1),
  amount: z.string().min(1),
  cadenceOrUnit: z.string().min(1),
  basis: z.enum(['fact', 'estimate', 'unknown']),
  rationale: z.string().min(1),
});

export const financialFeasibilityOutputSchema = z.object({
  sufficiencyAssessment: z.object({
    status: z.enum(['sufficient', 'partial', 'insufficient']),
    summary: z.string().min(1),
    missingFinancialInputs: z.array(z.string().min(1)),
  }),
  initialCapitalAllocation: z.array(financialLineItemSchema).min(1),
  fixedCosts: z.array(financialLineItemSchema).min(1),
  variableCosts: z.array(financialLineItemSchema).min(1),
  workingCapitalRequirements: z.object({
    summary: z.string().min(1),
    estimatedBuffer: z.string().min(1),
    basis: z.enum(['fact', 'estimate', 'unknown']),
    assumptions: z.array(z.string().min(1)),
  }),
  revenueModel: z.object({
    description: z.string().min(1),
    preservedProposedRates: z.array(z.string().min(1)),
    basis: z.enum(['fact', 'hypothesis', 'estimate']),
  }),
  revenuePerTransaction: z.object({
    valueOrFormula: z.string().min(1),
    basis: z.enum(['fact', 'estimate', 'unknown']),
    rationale: z.string().min(1),
  }),
  contributionMargin: z.object({
    valueOrFormula: z.string().min(1),
    basis: z.enum(['fact', 'estimate', 'unknown']),
    rationale: z.string().min(1),
  }),
  breakEvenAnalysis: z.object({
    summary: z.string().min(1),
    breakEvenThreshold: z.string().min(1),
    basis: z.enum(['fact', 'estimate', 'unknown']),
    requiredInputsToCalculate: z.array(z.string().min(1)),
  }),
  scenarioAnalysis: z
    .array(
      z.object({
        scenarioName: z.enum(['Conservative', 'Base', 'Upside']),
        assumptions: z.array(z.string().min(1)).min(1),
        projectedOutcome: z.string().min(1),
        basis: z.enum(['estimate', 'unknown']),
        feasibilityNote: z.string().min(1),
      })
    )
    .length(3),
});

export const manualCompetitorSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Competitor name is required').max(120),
  offeringSummary: z.string().trim().min(1, 'Offering summary is required').max(600),
  pricingModel: z.string().trim().max(200).default('Not specified'),
  perceivedStrengths: z.string().trim().max(500).default('Not specified'),
  perceivedWeaknesses: z.string().trim().max(500).default('Not specified'),
});

const competitiveInsightSchema = z.object({
  statement: z.string().min(1),
  sourceType: z.enum(['user_supplied', 'verified_external', 'ai_hypothesis']),
  basis: z.enum(['fact', 'hypothesis', 'recommendation']),
  rationale: z.string().optional(),
});

export const competitiveOutputSchema = z.object({
  verifiedExternalResearchConducted: z.boolean(),
  dataSourceNotice: z.string().min(1),
  positioningStatement: z.string().min(1),
  differentiationOpportunities: z.array(competitiveInsightSchema).min(2),
  potentialAdvantages: z.array(competitiveInsightSchema).min(2),
  potentialWeaknesses: z.array(competitiveInsightSchema).min(2),
  competitiveRisks: z.array(competitiveInsightSchema).min(2),
});

export const roadmapOutputSchema = z.object({
  phases: z
    .array(
      z.object({
        phaseKey: z.enum([
          'initial_validation',
          'planning_preparation',
          'launch',
          'growth',
        ]),
        phaseTitle: z.string().min(1),
        timeframe: z.string().min(1),
        entryConditions: z.array(z.string().min(1)).min(1),
        conditionalTriggers: z
          .array(
            z.object({
              condition: z.string().min(1),
              targetMilestone: z.string().min(1),
              metricThreshold: z.string().min(1),
            })
          )
          .min(1),
        objectives: z.array(z.string().min(1)).min(2),
        activities: z.array(z.string().min(1)).min(2),
        deliverables: z.array(z.string().min(1)).min(2),
        dependencies: z.array(z.string().min(1)).min(1),
        successIndicators: z.array(z.string().min(1)).min(2),
      })
    )
    .length(4),
});

export const consistencyValidationOutputSchema = z.object({
  overallStatus: z.enum(['consistent', 'warnings_detected', 'conflicts_detected']),
  summary: z.string().min(1),
  checks: z
    .array(
      z.object({
        id: z.string().min(1),
        category: z.enum([
          'revenue_model',
          'customer_priority',
          'budget',
          'timeline',
          'operational_assumption',
        ]),
        severity: z.enum(['conflict', 'warning', 'aligned']),
        title: z.string().min(1),
        description: z.string().min(1),
        affectedModules: z.array(z.string().min(1)).min(1),
        resolutionGuidance: z.string().min(1),
      })
    )
    .min(3),
});

export const executiveSummaryOutputSchema = z.object({
  executiveSummary: z.string().min(20),
  strategicThesis: z.string().min(10),
  criticalRisksAndAssumptions: z.array(epistemicItemSchema).min(2),
  recommendedNextSteps: z
    .array(
      z.object({
        action: z.string().min(1),
        priority: z.enum(['Immediate', 'Near-Term', 'Medium-Term']),
        ownerFocus: z.string().min(1),
      })
    )
    .min(3),
  transparencyLedger: z.object({
    confirmedInputs: z.array(z.string().min(1)).min(1),
    unvalidatedAssumptions: z.array(z.string().min(1)).min(1),
    recommendations: z.array(z.string().min(1)).min(1),
    missingInformation: z.array(z.string().min(1)),
    decisionsRequiringHumanValidation: z.array(z.string().min(1)).min(1),
  }),
});
