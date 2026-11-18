import { AlertTriangle, CheckCircle2, Download, FileCheck2, Play, ShieldCheck } from 'lucide-react';
import type { ConsistencyCheckCategory, ModuleKey, StrategyProject } from '../../types/strategy';
import { exportStrategyPdf } from '../../utils/pdfExport';
import { formatShortDate, getProjectCompletion } from '../../utils/projectProgress';
import { EpistemicTag } from '../ui/EpistemicTag';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

const CATEGORY_LABELS: Record<ConsistencyCheckCategory, string> = {
  revenue_model: 'Revenue Model',
  customer_priority: 'Customer Priority',
  budget: 'Budget Alignment',
  timeline: 'Timeline Realism',
  operational_assumption: 'Operational Assumption',
};

interface StrategyReportViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  isValidatingConsistency?: boolean;
  error: string | null;
  onValidateConsistency: () => Promise<void>;
  onGenerateExecutiveSummary: () => Promise<void>;
  onRunFullPipeline: () => Promise<void>;
  onNavigateModule: (module: ModuleKey) => void;
}

export function StrategyReportView({
  project,
  isGenerating,
  isValidatingConsistency = false,
  error,
  onValidateConsistency,
  onGenerateExecutiveSummary,
  onRunFullPipeline,
  onNavigateModule,
}: StrategyReportViewProps) {
  const completion = getProjectCompletion(project);
  const report = project.executiveReport;
  const consistency = project.consistencyValidation;
  const missingCount = completion.totalModules - completion.completedModules;

  return (
    <div className="space-y-8">
      <ModuleStatusHeader
        stepNumber="08. Strategy Report"
        title="Executive Strategy Report"
        description="Compiled multi-module strategy dossier with cross-module consistency auditing and a dedicated transparency ledger separating confirmed inputs, unvalidated assumptions, recommendations, and missing data."
        lastGeneratedAt={report?.generatedAt}
        actionLabel={report ? 'Regenerate Executive Summary' : 'Synthesize Executive Summary'}
        onAction={onGenerateExecutiveSummary}
        isLoading={isGenerating}
        error={error}
        secondaryAction={{
          label: 'Export PDF Report',
          onClick: () => exportStrategyPdf(project),
        }}
      />

      {/* Cross-Module Consistency Validation Audit */}
      <section className="rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              Pre-Compilation Audit
            </p>
            <h2 className="text-base font-semibold text-[#172B43]">
              Strategy Consistency Validation
            </h2>
            <p className="text-xs text-[#667085]">
              Cross-checks all generated modules against intake facts and clarification answers for conflicting revenue models, customer priorities, budgets, timelines, and operational assumptions.
            </p>
          </div>
          <button
            type="button"
            onClick={onValidateConsistency}
            disabled={isValidatingConsistency || isGenerating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D9] bg-white px-3.5 py-2 text-xs font-medium text-[#172B43] hover:bg-[#EBE7E0] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#E85A32]" />
            {isValidatingConsistency
              ? 'Checking Consistency...'
              : consistency
              ? 'Re-Run Consistency Check'
              : 'Run Consistency Check'}
          </button>
        </div>

        {consistency ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E6E1D9] bg-white px-4 py-3">
              {consistency.overallStatus === 'consistent' ? (
                <CheckCircle2 className="h-4 w-4 text-[#166534] shrink-0" />
              ) : (
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 ${
                    consistency.overallStatus === 'conflicts_detected'
                      ? 'text-[#B91C1C]'
                      : 'text-[#B45309]'
                  }`}
                />
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-[#172B43]">
                {consistency.overallStatus.replace(/_/g, ' ')}:
              </span>
              <span className="text-xs text-[#667085]">{consistency.summary}</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {consistency.checks.map((chk) => (
                <div
                  key={chk.id}
                  className="rounded-lg border border-[#E6E1D9] bg-white p-3.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                      {CATEGORY_LABELS[chk.category] ?? chk.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none ${
                        chk.severity === 'aligned'
                          ? 'border-[#B7E4C7] bg-[#F0FDF4] text-[#166534]'
                          : chk.severity === 'conflict'
                          ? 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]'
                          : 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
                      }`}
                    >
                      {chk.severity === 'aligned'
                        ? 'Aligned'
                        : chk.severity === 'conflict'
                        ? 'Conflict'
                        : 'Warning'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#172B43]">{chk.title}</p>
                  <p className="text-xs text-[#667085]">{chk.description}</p>
                  <p className="text-[11px] text-[#172B43]">
                    <span className="font-medium text-[#E85A32]">Action:</span>{' '}
                    {chk.resolutionGuidance}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#667085]">
            Run the consistency check or synthesize the Executive Summary to validate cross-module alignment automatically.
          </p>
        )}
      </section>

      {missingCount > 0 && (
        <div className="flex flex-col gap-4 rounded-xl border border-[#F6C8B8] bg-[#FFF5F2] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#172B43]">
              {completion.completedModules} of {completion.totalModules} modules completed (
              {completion.percentage}%)
            </p>
            <p className="mt-0.5 text-xs text-[#667085]">
              Generate any missing modules sequentially before exporting your final dossier.
            </p>
          </div>
          <button
            type="button"
            onClick={onRunFullPipeline}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E85A32] px-4 py-2 text-xs font-medium text-white hover:bg-[#D44A23] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            Complete Remaining Modules
          </button>
        </div>
      )}

      {/* Report Document Canvas */}
      <div className="rounded-xl border border-[#E6E1D9] bg-white p-6 sm:p-10 space-y-10">
        {/* Document Header */}
        <header className="border-b border-[#E6E1D9] pb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              <span>STRATOS AI Strategy Dossier</span>
              {project.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#B45309]">Demonstration Project</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => exportStrategyPdf(project)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D9] bg-white px-3.5 py-1.5 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#E85A32]" />
              Download PDF
            </button>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#172B43] sm:text-3xl">
            {project.intake.businessName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
            <span>{project.intake.industry}</span>
            <span aria-hidden="true">·</span>
            <span>{project.intake.targetGeography}</span>
            <span aria-hidden="true">·</span>
            <span>Stage: {project.intake.businessStage}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[#172B43] tabular-nums">
              Budget: {project.intake.estimatedStartingBudget}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Updated {formatShortDate(project.updatedAt)}</span>
          </div>
        </header>

        {/* 1. Executive Summary */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-[#172B43]">
            1. Executive Summary
          </h3>
          {report ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32] mb-1">
                  Strategic Thesis
                </p>
                <p className="text-sm leading-relaxed text-[#172B43]">
                  {report.strategicThesis}
                </p>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-[#172B43] whitespace-pre-line">
                {report.executiveSummary}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/60 p-5 flex items-center justify-between gap-4">
              <p className="text-sm text-[#667085]">
                Executive Summary has not been synthesized yet.
              </p>
              <button
                type="button"
                onClick={onGenerateExecutiveSummary}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E85A32] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Synthesize Now
              </button>
            </div>
          )}
        </section>

        {/* 2. Business Overview */}
        <section className="space-y-3 border-t border-[#E6E1D9] pt-8">
          <h3 className="text-lg font-semibold text-[#172B43]">
            2. Business Overview
          </h3>
          <p className="text-sm leading-relaxed text-[#172B43]">
            {project.intake.businessDescription}
          </p>
          <div className="grid gap-4 pt-2 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs font-medium text-[#667085]">Intended Customers</p>
              <p className="mt-0.5 text-[#172B43]">{project.intake.intendedCustomers}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-[#667085]">Main Business Objective</p>
              <p className="mt-0.5 text-[#172B43]">{project.intake.mainObjective}</p>
            </div>
          </div>
          {project.ideaAnalysis && (
            <div className="pt-2">
              <p className="text-xs font-medium text-[#667085]">Analyzed Value Proposition</p>
              <p className="mt-0.5 text-sm text-[#172B43]">
                {project.ideaAnalysis.coreValueProposition}
              </p>
            </div>
          )}
        </section>

        {/* 3. Customer Personas */}
        <section className="space-y-4 border-t border-[#E6E1D9] pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172B43]">
              3. Customer Personas
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('personas')}
              className="text-xs font-medium text-[#E85A32] hover:underline cursor-pointer"
            >
              Edit in Module
            </button>
          </div>
          {project.personas?.items?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {project.personas.items.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#172B43]">
                      {p.personaName}
                    </h4>
                    <EpistemicTag basis={p.demographics.basis} />
                  </div>
                  <p className="text-xs font-medium text-[#E85A32]">{p.roleOrArchetype}</p>
                  <p className="text-xs text-[#172B43]">{p.demographics.summary}</p>
                  <p className="text-xs text-[#667085] pt-1">
                    Primary Pain: {p.painPoints[0]?.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#667085]">Not generated yet.</p>
          )}
        </section>

        {/* 4. SWOT Analysis */}
        <section className="space-y-4 border-t border-[#E6E1D9] pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172B43]">4. SWOT Analysis</h3>
            <button
              type="button"
              onClick={() => onNavigateModule('swot')}
              className="text-xs font-medium text-[#E85A32] hover:underline cursor-pointer"
            >
              Edit in Module
            </button>
          </div>
          {project.swot ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['Strengths', project.swot.strengths],
                  ['Weaknesses', project.swot.weaknesses],
                  ['Opportunities', project.swot.opportunities],
                  ['Threats', project.swot.threats],
                ] as const
              ).map(([label, entries]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4 space-y-2"
                >
                  <h4 className="text-xs font-semibold text-[#172B43]">{label}</h4>
                  <ul className="space-y-2">
                    {entries.map((entry) => (
                      <li key={entry.id} className="text-xs text-[#172B43] space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-[#172B43]">{entry.point}</span>
                          <EpistemicTag basis={entry.basis} />
                        </div>
                        <p className="text-[#667085]">{entry.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#667085]">Not generated yet.</p>
          )}
        </section>

        {/* 5. Business Model */}
        <section className="space-y-4 border-t border-[#E6E1D9] pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172B43]">5. Business Model</h3>
            <button
              type="button"
              onClick={() => onNavigateModule('business_model')}
              className="text-xs font-medium text-[#E85A32] hover:underline cursor-pointer"
            >
              Edit in Module
            </button>
          </div>
          {project.businessModel ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ['Value Proposition', project.businessModel.valueProposition],
                  ['Customer Segments', project.businessModel.customerSegments],
                  ['Revenue Streams', project.businessModel.revenueStreams],
                  ['Channels', project.businessModel.distributionChannels],
                  ['Relationships', project.businessModel.customerRelationships],
                  ['Key Activities', project.businessModel.keyActivities],
                  ['Key Resources', project.businessModel.keyResources],
                  ['Cost Structure', project.businessModel.costStructure],
                ] as const
              ).map(([label, items]) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-3.5 space-y-2"
                >
                  <h4 className="text-xs font-semibold text-[#172B43]">{label}</h4>
                  <ul className="space-y-1.5 text-xs text-[#667085]">
                    {items.map((item) => (
                      <li key={item.id}>• {item.text}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#667085]">Not generated yet.</p>
          )}
        </section>

        {/* 6. Financial Feasibility */}
        <section className="space-y-4 border-t border-[#E6E1D9] pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172B43]">
              6. Financial Feasibility & Unit Economics
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('financial_feasibility')}
              className="text-xs font-medium text-[#E85A32] hover:underline cursor-pointer"
            >
              View Full Model
            </button>
          </div>
          {project.financialFeasibility ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4 space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B45309]">
                  Data Sufficiency: {project.financialFeasibility.sufficiencyAssessment.status}
                </p>
                <p className="text-xs text-[#172B43]">
                  {project.financialFeasibility.sufficiencyAssessment.summary}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-[#E6E1D9] bg-white p-3.5 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                    Revenue Per Transaction
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#172B43]">
                    {project.financialFeasibility.revenuePerTransaction.valueOrFormula}
                  </p>
                </div>
                <div className="rounded-lg border border-[#E6E1D9] bg-white p-3.5 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                    Contribution Margin
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#172B43]">
                    {project.financialFeasibility.contributionMargin.valueOrFormula}
                  </p>
                </div>
                <div className="rounded-lg border border-[#E6E1D9] bg-white p-3.5 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                    Break-Even Threshold
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#172B43]">
                    {project.financialFeasibility.breakEvenAnalysis.breakEvenThreshold}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#667085]">Not generated yet.</p>
          )}
        </section>

        {/* 7. Competitive Positioning */}
        <section className="space-y-3 border-t border-[#E6E1D9] pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172B43]">
              7. Competitive Positioning
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('competitive')}
              className="text-xs font-medium text-[#E85A32] hover:underline cursor-pointer"
            >
              Edit in Module
            </button>
          </div>
          {project.competitivePositioning ? (
            <div className="space-y-3 text-sm">
              <p className="text-xs text-[#667085]">
                External Research Conducted:{' '}
                <span className="font-medium text-[#172B43]">
                  {project.competitivePositioning.verifiedExternalResearchConducted
                    ? 'Yes'
                    : 'No external sources retrieved'}
                </span>{' '}
                — {project.competitivePositioning.dataSourceNotice}
              </p>
              <p className="text-[#172B43]">
                {project.competitivePositioning.positioningStatement}
              </p>
              <ul className="space-y-1.5 text-xs text-[#667085]">
                {project.competitivePositioning.differentiationOpportunities.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span>• {d.statement}</span>
                    <EpistemicTag basis={d.basis} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[#667085]">Not generated yet.</p>
          )}
        </section>

        {/* 8. Strategic Roadmap */}
        <section className="space-y-4 border-t border-[#E6E1D9] pt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#172B43]">
              8. Conditional Strategic Roadmap
            </h3>
            <button
              type="button"
              onClick={() => onNavigateModule('roadmap')}
              className="text-xs font-medium text-[#E85A32] hover:underline cursor-pointer"
            >
              View Full Phases
            </button>
          </div>
          {project.roadmap?.phases?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {project.roadmap.phases.map((phase) => (
                <div
                  key={phase.phaseKey}
                  className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4 space-y-2"
                >
                  <p className="font-mono text-xs font-medium text-[#E85A32]">
                    {phase.timeframe}
                  </p>
                  <h4 className="text-sm font-semibold text-[#172B43]">
                    {phase.phaseTitle}
                  </h4>
                  <ul className="space-y-1 text-xs text-[#667085]">
                    {phase.objectives.map((o, i) => (
                      <li key={i}>• {o}</li>
                    ))}
                  </ul>
                  {(phase.conditionalTriggers?.length ?? 0) > 0 && (
                    <p className="pt-1 border-t border-[#E6E1D9] text-[11px] text-[#172B43]">
                      <span className="font-semibold text-[#E85A32]">Gate:</span>{' '}
                      {phase.conditionalTriggers[0].metricThreshold}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#667085]">Not generated yet.</p>
          )}
        </section>

        {/* 9. Risks & Assumptions + Recommended Next Steps */}
        <section className="grid gap-6 border-t border-[#E6E1D9] pt-8 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#172B43]">
              9. Risks & Unvalidated Assumptions
            </h3>
            <ul className="space-y-2.5">
              {(
                report?.criticalRisksAndAssumptions ??
                project.ideaAnalysis?.keyBusinessRisks ??
                []
              ).map((risk, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 text-sm text-[#172B43]"
                >
                  <div>
                    <p>{risk.statement}</p>
                    {risk.rationale && (
                      <p className="text-xs text-[#667085]">{risk.rationale}</p>
                    )}
                  </div>
                  <EpistemicTag basis={risk.basis} />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#172B43]">
              Recommended Next Steps
            </h3>
            {report?.recommendedNextSteps?.length ? (
              <ul className="space-y-2.5">
                {report.recommendedNextSteps.map((step, idx) => (
                  <li
                    key={idx}
                    className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#667085] mb-1">
                      <span className="font-semibold text-[#E85A32]">{step.priority}</span>
                      <span>{step.ownerFocus}</span>
                    </div>
                    <p className="text-[#172B43]">{step.action}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#667085]">
                Synthesize the Executive Summary to generate prioritized next steps.
              </p>
            )}
          </div>
        </section>

        {/* 10. Report Transparency Ledger */}
        <section className="space-y-4 border-t border-[#E6E1D9] pt-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              Epistemic Audit Trail
            </p>
            <h3 className="text-lg font-semibold text-[#172B43]">
              10. Report Transparency Ledger
            </h3>
            <p className="text-xs text-[#667085]">
              Explicit separation between verified user inputs, unvalidated assumptions, strategic recommendations, missing data, and decisions requiring human validation.
            </p>
          </div>

          {report?.transparencyLedger ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  {
                    title: 'Confirmed Inputs',
                    tone: 'border-[#B7E4C7] bg-[#F0FDF4]',
                    titleTone: 'text-[#166534]',
                    items: report.transparencyLedger.confirmedInputs,
                  },
                  {
                    title: 'Unvalidated Assumptions',
                    tone: 'border-[#F6C8B8] bg-[#FFF5F2]',
                    titleTone: 'text-[#C8441E]',
                    items: report.transparencyLedger.unvalidatedAssumptions,
                  },
                  {
                    title: 'Recommendations',
                    tone: 'border-[#D5DCE4] bg-[#F5F3EF]',
                    titleTone: 'text-[#172B43]',
                    items: report.transparencyLedger.recommendations,
                  },
                  {
                    title: 'Missing Information',
                    tone: 'border-[#FDE68A] bg-[#FFFBEB]',
                    titleTone: 'text-[#B45309]',
                    items: report.transparencyLedger.missingInformation,
                  },
                  {
                    title: 'Decisions Requiring Human Validation',
                    tone: 'border-[#E6E1D9] bg-white',
                    titleTone: 'text-[#E85A32]',
                    items: report.transparencyLedger.decisionsRequiringHumanValidation,
                  },
                ] as const
              ).map((bucket) => (
                <div
                  key={bucket.title}
                  className={`rounded-lg border p-4 space-y-2 ${bucket.tone}`}
                >
                  <h4 className={`text-xs font-semibold uppercase tracking-wider ${bucket.titleTone}`}>
                    {bucket.title}
                  </h4>
                  {bucket.items.length === 0 ? (
                    <p className="text-xs text-[#667085]">None recorded.</p>
                  ) : (
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[#172B43]">
                      {bucket.items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#667085]">
              Synthesize the Executive Summary to generate the full Report Transparency Ledger.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
