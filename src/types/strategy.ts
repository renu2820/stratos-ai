export type BusinessStage =
  | 'Idea / Concept'
  | 'Pre-Seed / Validation'
  | 'MVP / Early Traction'
  | 'Operating Small Business'
  | 'Scaling';

export type ProjectStatus = 'Draft' | 'Clarifying' | 'In Progress' | 'Complete';

export type EvidenceBasis = 'fact' | 'hypothesis' | 'recommendation';

export type FinancialBasis = 'fact' | 'estimate' | 'unknown';

export type CompetitiveSourceType =
  | 'user_supplied'
  | 'verified_external'
  | 'ai_hypothesis';

export interface BusinessIntake {
  businessName: string;
  businessDescription: string;
  industry: string;
  targetGeography: string;
  intendedCustomers: string;
  estimatedStartingBudget: string;
  businessStage: BusinessStage | string;
  mainObjective: string;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  category: string;
  answer: string;
}

export interface EpistemicItem {
  statement: string;
  basis: EvidenceBasis;
  rationale?: string;
}

export interface IdeaAnalysis {
  analyzedAt: string;
  coreValueProposition: string;
  suppliedFactsSummary: string[];
  targetMarketAssumptions: EpistemicItem[];
  potentialCustomerProblems: EpistemicItem[];
  missingInformation: string[];
  clarificationQuestions: ClarificationQuestion[];
  keyBusinessRisks: EpistemicItem[];
}

export interface PersonaTrait {
  text: string;
  basis: 'fact' | 'hypothesis';
}

export interface CustomerPersona {
  id: string;
  personaName: string;
  roleOrArchetype: string;
  demographics: {
    summary: string;
    basis: 'fact' | 'hypothesis';
  };
  goals: PersonaTrait[];
  painPoints: PersonaTrait[];
  purchasingMotivations: PersonaTrait[];
  expectedBehavior: PersonaTrait[];
  customerNeeds: PersonaTrait[];
}

export interface SwotEntry {
  id: string;
  point: string;
  rationale: string;
  basis: 'fact' | 'hypothesis';
  impact: 'high' | 'medium' | 'low';
}

export interface SwotAnalysis {
  generatedAt: string;
  strengths: SwotEntry[];
  weaknesses: SwotEntry[];
  opportunities: SwotEntry[];
  threats: SwotEntry[];
}

export interface BusinessModelBlockItem {
  id: string;
  text: string;
  basis: EvidenceBasis;
}

export interface BusinessModelCanvas {
  generatedAt: string;
  valueProposition: BusinessModelBlockItem[];
  customerSegments: BusinessModelBlockItem[];
  revenueStreams: BusinessModelBlockItem[];
  keyResources: BusinessModelBlockItem[];
  keyActivities: BusinessModelBlockItem[];
  costStructure: BusinessModelBlockItem[];
  distributionChannels: BusinessModelBlockItem[];
  customerRelationships: BusinessModelBlockItem[];
}

export interface FinancialLineItem {
  id: string;
  item: string;
  amount: string;
  cadenceOrUnit: string;
  basis: FinancialBasis;
  rationale: string;
}

export interface FinancialScenario {
  scenarioName: 'Conservative' | 'Base' | 'Upside';
  assumptions: string[];
  projectedOutcome: string;
  basis: 'estimate' | 'unknown';
  feasibilityNote: string;
}

export interface FinancialFeasibility {
  generatedAt: string;
  sufficiencyAssessment: {
    status: 'sufficient' | 'partial' | 'insufficient';
    summary: string;
    missingFinancialInputs: string[];
  };
  initialCapitalAllocation: FinancialLineItem[];
  fixedCosts: FinancialLineItem[];
  variableCosts: FinancialLineItem[];
  workingCapitalRequirements: {
    summary: string;
    estimatedBuffer: string;
    basis: FinancialBasis;
    assumptions: string[];
  };
  revenueModel: {
    description: string;
    preservedProposedRates: string[];
    basis: 'fact' | 'hypothesis' | 'estimate';
  };
  revenuePerTransaction: {
    valueOrFormula: string;
    basis: FinancialBasis;
    rationale: string;
  };
  contributionMargin: {
    valueOrFormula: string;
    basis: FinancialBasis;
    rationale: string;
  };
  breakEvenAnalysis: {
    summary: string;
    breakEvenThreshold: string;
    basis: FinancialBasis;
    requiredInputsToCalculate: string[];
  };
  scenarioAnalysis: FinancialScenario[];
}

export interface ManualCompetitor {
  id: string;
  name: string;
  offeringSummary: string;
  pricingModel: string;
  perceivedStrengths: string;
  perceivedWeaknesses: string;
}

export interface CompetitiveInsightItem {
  statement: string;
  sourceType: CompetitiveSourceType;
  basis: EvidenceBasis;
  rationale?: string;
}

export interface CompetitivePositioning {
  generatedAt: string;
  competitorsAnalyzedCount: number;
  verifiedExternalResearchConducted: boolean;
  dataSourceNotice: string;
  positioningStatement: string;
  differentiationOpportunities: CompetitiveInsightItem[];
  potentialAdvantages: CompetitiveInsightItem[];
  potentialWeaknesses: CompetitiveInsightItem[];
  competitiveRisks: CompetitiveInsightItem[];
}

export type RoadmapPhaseKey =
  | 'initial_validation'
  | 'planning_preparation'
  | 'launch'
  | 'growth';

export interface ConditionalTrigger {
  condition: string;
  targetMilestone: string;
  metricThreshold: string;
}

export interface RoadmapPhase {
  phaseKey: RoadmapPhaseKey;
  phaseTitle: string;
  timeframe: string;
  entryConditions: string[];
  conditionalTriggers: ConditionalTrigger[];
  objectives: string[];
  activities: string[];
  deliverables: string[];
  dependencies: string[];
  successIndicators: string[];
}

export interface StrategicRoadmap {
  generatedAt: string;
  phases: RoadmapPhase[];
}

export type ConsistencyCheckCategory =
  | 'revenue_model'
  | 'customer_priority'
  | 'budget'
  | 'timeline'
  | 'operational_assumption';

export interface ConsistencyCheckItem {
  id: string;
  category: ConsistencyCheckCategory;
  severity: 'conflict' | 'warning' | 'aligned';
  title: string;
  description: string;
  affectedModules: string[];
  resolutionGuidance: string;
}

export interface ConsistencyValidation {
  validatedAt: string;
  overallStatus: 'consistent' | 'warnings_detected' | 'conflicts_detected';
  summary: string;
  checks: ConsistencyCheckItem[];
}

export interface RecommendedStep {
  action: string;
  priority: 'Immediate' | 'Near-Term' | 'Medium-Term';
  ownerFocus: string;
}

export interface ReportTransparencyLedger {
  confirmedInputs: string[];
  unvalidatedAssumptions: string[];
  recommendations: string[];
  missingInformation: string[];
  decisionsRequiringHumanValidation: string[];
}

export interface ExecutiveReportSynthesis {
  generatedAt: string;
  executiveSummary: string;
  strategicThesis: string;
  criticalRisksAndAssumptions: EpistemicItem[];
  recommendedNextSteps: RecommendedStep[];
  transparencyLedger?: ReportTransparencyLedger;
}

export interface StrategyProject {
  id: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  intake: BusinessIntake;
  ideaAnalysis?: IdeaAnalysis;
  clarificationsSubmitted: boolean;
  additionalClarificationNotes?: string[];
  personas?: {
    generatedAt: string;
    items: CustomerPersona[];
  };
  swot?: SwotAnalysis;
  businessModel?: BusinessModelCanvas;
  financialFeasibility?: FinancialFeasibility;
  manualCompetitors: ManualCompetitor[];
  competitivePositioning?: CompetitivePositioning;
  roadmap?: StrategicRoadmap;
  consistencyValidation?: ConsistencyValidation;
  executiveReport?: ExecutiveReportSynthesis;
}

export type ModuleKey =
  | 'dashboard'
  | 'idea_analyzer'
  | 'personas'
  | 'swot'
  | 'business_model'
  | 'financial_feasibility'
  | 'competitive'
  | 'roadmap'
  | 'report';
