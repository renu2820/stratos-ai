import { AlertTriangle, Calculator, CheckCircle2, HelpCircle } from 'lucide-react';
import type {
  FinancialBasis,
  FinancialLineItem,
  StrategyProject,
} from '../../types/strategy';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

interface FinancialFeasibilityViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => Promise<void>;
}

const FINANCIAL_BASIS_STYLE: Record<
  FinancialBasis | 'hypothesis',
  { label: string; className: string }
> = {
  fact: {
    label: 'User-Provided Fact',
    className: 'border-[#B7E4C7] bg-[#F0FDF4] text-[#166534]',
  },
  estimate: {
    label: 'AI Estimate',
    className: 'border-[#F6C8B8] bg-[#FFF5F2] text-[#C8441E]',
  },
  hypothesis: {
    label: 'Unvalidated Proposal',
    className: 'border-[#F6C8B8] bg-[#FFF5F2] text-[#C8441E]',
  },
  unknown: {
    label: 'Unknown / Unquoted',
    className: 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]',
  },
};

function FinancialBasisTag({ basis }: { basis: FinancialBasis | 'hypothesis' }) {
  const cfg = FINANCIAL_BASIS_STYLE[basis] ?? FINANCIAL_BASIS_STYLE.unknown;
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-tight whitespace-nowrap shrink-0 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}

function CostTable({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: FinancialLineItem[];
}) {
  return (
    <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#172B43]">{title}</h3>
        <p className="text-xs text-[#667085]">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[#667085]">No line items identified yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E6E1D9] text-xs text-[#667085]">
                <th className="py-2 pr-4 font-medium">Line Item</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Cadence / Unit</th>
                <th className="py-2 font-medium">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D9]">
              {items.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-[#172B43]">{row.item}</p>
                    <p className="mt-0.5 text-xs text-[#667085]">{row.rationale}</p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs font-medium text-[#172B43] whitespace-nowrap tabular-nums">
                    {row.amount}
                  </td>
                  <td className="py-3 pr-4 text-xs text-[#667085] whitespace-nowrap">
                    {row.cadenceOrUnit}
                  </td>
                  <td className="py-3">
                    <FinancialBasisTag basis={row.basis} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function FinancialFeasibilityView({
  project,
  isGenerating,
  error,
  onGenerate,
}: FinancialFeasibilityViewProps) {
  const fin = project.financialFeasibility;

  const sufficiencyTone =
    fin?.sufficiencyAssessment.status === 'sufficient'
      ? {
          box: 'border-[#B7E4C7] bg-[#F0FDF4]',
          badge: 'text-[#166534]',
          label: 'Sufficient Financial Inputs',
          Icon: CheckCircle2,
        }
      : fin?.sufficiencyAssessment.status === 'insufficient'
      ? {
          box: 'border-[#FDE68A] bg-[#FFFBEB]',
          badge: 'text-[#B45309]',
          label: 'Insufficient Financial Inputs — Calculations Gated',
          Icon: AlertTriangle,
        }
      : {
          box: 'border-[#E6E1D9] bg-[#F5F3EF]',
          badge: 'text-[#B45309]',
          label: 'Partial Financial Inputs — Missing Quotes Marked Unknown',
          Icon: HelpCircle,
        };

  return (
    <div className="space-y-6">
      <ModuleStatusHeader
        stepNumber="05. Financial Feasibility"
        title="Financial Feasibility & Unit Economics"
        description="Structured assessment of capital allocation, fixed and variable costs, unit economics, break-even thresholds, and scenario sensitivity—explicitly separating supplied inputs, AI estimates, and unquoted unknowns."
        lastGeneratedAt={fin?.generatedAt}
        actionLabel={fin ? 'Re-Evaluate Financials' : 'Analyze Financial Feasibility'}
        onAction={onGenerate}
        isLoading={isGenerating}
        error={error}
      />

      {isGenerating && !fin ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]"
              />
            ))}
          </div>
        </div>
      ) : !fin ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <Calculator className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            Financial Feasibility not analyzed yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-[#667085]">
            Evaluate budget allocation, revenue per transaction, contribution margin,
            break-even thresholds, and scenario sensitivity without fabricating supplier quotes.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="mt-5 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] cursor-pointer"
          >
            Analyze Financial Feasibility
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sufficiency Assessment Banner */}
          <section className={`rounded-xl border p-5 space-y-3 ${sufficiencyTone.box}`}>
            <div className="flex items-start gap-3">
              <sufficiencyTone.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${sufficiencyTone.badge}`} />
              <div className="space-y-1.5 flex-1">
                <p className={`text-xs font-semibold uppercase tracking-wider ${sufficiencyTone.badge}`}>
                  {sufficiencyTone.label}
                </p>
                <p className="text-sm leading-relaxed text-[#172B43]">
                  {fin.sufficiencyAssessment.summary}
                </p>
              </div>
            </div>

            {fin.sufficiencyAssessment.missingFinancialInputs.length > 0 && (
              <div className="border-t border-[#E6E1D9] pt-3 pl-7">
                <p className="text-xs font-semibold text-[#172B43] mb-1.5">
                  Missing Financial Inputs Required for Exact Modeling:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#667085]">
                  {fin.sufficiencyAssessment.missingFinancialInputs.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Revenue Model & Unit Economics Snapshot */}
          <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                  Revenue Architecture
                </p>
                <h2 className="text-base font-semibold text-[#172B43]">
                  Proposed Revenue Model & Preserved Founder Inputs
                </h2>
              </div>
              <FinancialBasisTag basis={fin.revenueModel.basis} />
            </div>

            <p className="text-sm leading-relaxed text-[#172B43]">
              {fin.revenueModel.description}
            </p>

            {fin.revenueModel.preservedProposedRates.length > 0 && (
              <div className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                  Preserved Proposed Rates (Unvalidated Business Assumptions)
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#172B43]">
                  {fin.revenueModel.preservedProposedRates.map((rate, idx) => (
                    <li key={idx}>{rate}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Unit Economics & Break-Even Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-xl border border-[#E6E1D9] bg-white p-5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                  Revenue Per Transaction
                </h3>
                <FinancialBasisTag basis={fin.revenuePerTransaction.basis} />
              </div>
              <p className="font-mono text-sm font-semibold text-[#172B43]">
                {fin.revenuePerTransaction.valueOrFormula}
              </p>
              <p className="text-xs leading-relaxed text-[#667085]">
                {fin.revenuePerTransaction.rationale}
              </p>
            </article>

            <article className="rounded-xl border border-[#E6E1D9] bg-white p-5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                  Contribution Margin
                </h3>
                <FinancialBasisTag basis={fin.contributionMargin.basis} />
              </div>
              <p className="font-mono text-sm font-semibold text-[#172B43]">
                {fin.contributionMargin.valueOrFormula}
              </p>
              <p className="text-xs leading-relaxed text-[#667085]">
                {fin.contributionMargin.rationale}
              </p>
            </article>

            <article className="rounded-xl border border-[#E6E1D9] bg-white p-5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                  Break-Even Threshold
                </h3>
                <FinancialBasisTag basis={fin.breakEvenAnalysis.basis} />
              </div>
              <p className="font-mono text-sm font-semibold text-[#172B43]">
                {fin.breakEvenAnalysis.breakEvenThreshold}
              </p>
              <p className="text-xs leading-relaxed text-[#667085]">
                {fin.breakEvenAnalysis.summary}
              </p>
              {fin.breakEvenAnalysis.requiredInputsToCalculate.length > 0 && (
                <div className="border-t border-[#E6E1D9] pt-2">
                  <p className="text-[11px] font-semibold text-[#B45309] mb-1">
                    Inputs needed to calculate:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#667085]">
                    {fin.breakEvenAnalysis.requiredInputsToCalculate.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          </div>

          {/* Capital Allocation, Fixed Costs, Variable Costs */}
          <CostTable
            title="Initial Capital Allocation"
            subtitle="Deployment of starting budget across setup, tooling, and reserves."
            items={fin.initialCapitalAllocation}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <CostTable
              title="Fixed Costs"
              subtitle="Recurring monthly commitments independent of transaction volume."
              items={fin.fixedCosts}
            />
            <CostTable
              title="Variable Costs"
              subtitle="Per-order, per-tote, or per-transaction fulfillment costs."
              items={fin.variableCosts}
            />
          </div>

          {/* Working Capital Requirements */}
          <section className="rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                  Liquidity & Runway
                </p>
                <h3 className="text-base font-semibold text-[#172B43]">
                  Working Capital Requirements
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#172B43]">
                  {fin.workingCapitalRequirements.estimatedBuffer}
                </span>
                <FinancialBasisTag basis={fin.workingCapitalRequirements.basis} />
              </div>
            </div>
            <p className="text-sm text-[#172B43] leading-relaxed">
              {fin.workingCapitalRequirements.summary}
            </p>
            {fin.workingCapitalRequirements.assumptions.length > 0 && (
              <ul className="list-disc pl-4 space-y-1 text-xs text-[#667085]">
                {fin.workingCapitalRequirements.assumptions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Scenario Analysis */}
          <section className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                Sensitivity Modeling
              </p>
              <h3 className="text-base font-semibold text-[#172B43]">
                Scenario Analysis (Conservative / Base / Upside)
              </h3>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {fin.scenarioAnalysis.map((sc) => (
                <article
                  key={sc.scenarioName}
                  className="rounded-xl border border-[#E6E1D9] bg-white p-5 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#172B43]">
                        {sc.scenarioName} Case
                      </h4>
                      <FinancialBasisTag basis={sc.basis} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1">
                        Operating Assumptions
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-[#667085]">
                        {sc.assumptions.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] mb-1">
                        Projected Outcome
                      </p>
                      <p className="text-xs leading-relaxed text-[#172B43]">
                        {sc.projectedOutcome}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-[#E6E1D9] pt-2.5 text-xs text-[#667085]">
                    <span className="font-medium text-[#172B43]">Feasibility:</span>{' '}
                    {sc.feasibilityNote}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
