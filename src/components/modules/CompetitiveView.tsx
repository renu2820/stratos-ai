import { useEffect, useState, type FormEvent } from 'react';
import { Info, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import type {
  CompetitiveSourceType,
  ManualCompetitor,
  StrategyProject,
} from '../../types/strategy';
import { EpistemicTag } from '../ui/EpistemicTag';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

const SOURCE_TYPE_CONFIG: Record<
  CompetitiveSourceType,
  { label: string; className: string }
> = {
  user_supplied: {
    label: 'User-Provided',
    className: 'border-[#B7E4C7] bg-[#F0FDF4] text-[#166534]',
  },
  verified_external: {
    label: 'Verified External',
    className: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',
  },
  ai_hypothesis: {
    label: 'AI Hypothesis',
    className: 'border-[#F6C8B8] bg-[#FFF5F2] text-[#C8441E]',
  },
};

interface CompetitiveViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onSaveCompetitors: (competitors: ManualCompetitor[]) => Promise<void>;
  onGenerate: (competitors: ManualCompetitor[]) => Promise<void>;
}

const EMPTY_COMPETITOR = {
  name: '',
  offeringSummary: '',
  pricingModel: '',
  perceivedStrengths: '',
  perceivedWeaknesses: '',
};

export function CompetitiveView({
  project,
  isGenerating,
  error,
  onSaveCompetitors,
  onGenerate,
}: CompetitiveViewProps) {
  const [competitors, setCompetitors] = useState<ManualCompetitor[]>(
    project.manualCompetitors ?? []
  );

  useEffect(() => {
    setCompetitors(project.manualCompetitors ?? []);
  }, [project.id, project.manualCompetitors]);

  const [form, setForm] = useState(EMPTY_COMPETITOR);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCompetitor = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.offeringSummary.trim()) return;
    const next: ManualCompetitor[] = [
      ...competitors,
      {
        id: `comp-${Date.now()}`,
        name: form.name.trim(),
        offeringSummary: form.offeringSummary.trim(),
        pricingModel: form.pricingModel.trim() || 'Not specified',
        perceivedStrengths: form.perceivedStrengths.trim() || 'Not specified',
        perceivedWeaknesses: form.perceivedWeaknesses.trim() || 'Not specified',
      },
    ];
    setCompetitors(next);
    setForm(EMPTY_COMPETITOR);
    setShowAddForm(false);
    await onSaveCompetitors(next);
  };

  const handleRemoveCompetitor = async (id: string) => {
    const next = competitors.filter((c) => c.id !== id);
    setCompetitors(next);
    await onSaveCompetitors(next);
  };

  const positioning = project.competitivePositioning;

  const inputClass =
    'w-full rounded-lg border border-[#E6E1D9] bg-white px-3 py-1.5 text-sm text-[#172B43] placeholder:text-[#98A2B3] focus:border-[#E85A32] focus:outline-none';

  return (
    <div className="space-y-6">
      <ModuleStatusHeader
        stepNumber="06. Competitive Matrix"
        title="Competitive Positioning"
        description="Enter known competitors or status-quo alternatives manually. STRATOS AI analyzes differentiation and risks strictly from your supplied data—never inventing external competitor metrics."
        lastGeneratedAt={positioning?.generatedAt}
        actionLabel={
          positioning ? 'Re-Analyze Positioning' : 'Analyze Competitive Positioning'
        }
        onAction={() => onGenerate(competitors)}
        isLoading={isGenerating}
        error={error}
      />

      {/* Epistemic Grounding Guardrail Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#E85A32]" />
        <p className="text-xs leading-relaxed text-[#667085]">
          <span className="font-semibold text-[#172B43]">Source Integrity Policy:</span>{' '}
          STRATOS AI never fabricates real-world competitor pricing, market share, or claim
          that live external market research was conducted. Add competitor observations below
          to ground the positioning analysis in real context.
        </p>
      </div>

      {/* User-Supplied Competitors Section */}
      <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              Manual Inputs
            </p>
            <h2 className="text-base font-semibold text-[#172B43]">
              User-Supplied Competitors & Alternatives ({competitors.length})
            </h2>
            <p className="text-xs text-[#667085]">
              Include direct competitors, regional incumbents, or status-quo manual workarounds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D9] bg-white px-3.5 py-2 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#E85A32]" />
            Add Competitor
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddCompetitor}
            className="rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-4 space-y-3"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#172B43]">
                  Competitor / Alternative Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Local Freight Broker or Spreadsheet Workflow"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#172B43]">
                  Observed Pricing Model
                </label>
                <input
                  type="text"
                  value={form.pricingModel}
                  onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
                  placeholder="e.g. $49/seat/mo or commission-based"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#172B43]">
                Offering Summary *
              </label>
              <input
                type="text"
                required
                value={form.offeringSummary}
                onChange={(e) => setForm({ ...form, offeringSummary: e.target.value })}
                placeholder="What do they offer and who do they serve?"
                className={inputClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#172B43]">
                  Perceived Strengths
                </label>
                <input
                  type="text"
                  value={form.perceivedStrengths}
                  onChange={(e) =>
                    setForm({ ...form, perceivedStrengths: e.target.value })
                  }
                  placeholder="Known distribution, brand trust..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#172B43]">
                  Perceived Weaknesses
                </label>
                <input
                  type="text"
                  value={form.perceivedWeaknesses}
                  onChange={(e) =>
                    setForm({ ...form, perceivedWeaknesses: e.target.value })
                  }
                  placeholder="Slow onboarding, high minimums..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg border border-[#E6E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#172B43] hover:bg-[#EBE7E0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#E85A32] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#D44A23] cursor-pointer"
              >
                Save Competitor
              </button>
            </div>
          </form>
        )}

        {competitors.length === 0 ? (
          <p className="text-sm text-[#667085]">
            No manual competitors entered yet. You can add competitors above or run a
            structural positioning hypothesis based solely on your venture profile.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6E1D9] text-xs text-[#667085]">
                  <th className="py-2.5 pr-4 font-medium">Competitor</th>
                  <th className="py-2.5 pr-4 font-medium">Offering</th>
                  <th className="py-2.5 pr-4 font-medium">Pricing</th>
                  <th className="py-2.5 pr-4 font-medium">Strengths / Weaknesses</th>
                  <th className="py-2.5 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D9]">
                {competitors.map((comp) => (
                  <tr key={comp.id} className="align-top hover:bg-[#F5F3EF]/50">
                    <td className="py-3 pr-4 font-medium text-[#172B43]">
                      {comp.name}
                    </td>
                    <td className="py-3 pr-4 text-[#667085]">{comp.offeringSummary}</td>
                    <td className="py-3 pr-4 text-xs text-[#172B43]">{comp.pricingModel}</td>
                    <td className="py-3 pr-4 text-xs text-[#667085] space-y-1">
                      <p>
                        <span className="font-medium text-[#166534]">Strengths:</span>{' '}
                        {comp.perceivedStrengths}
                      </p>
                      <p>
                        <span className="font-medium text-[#B45309]">Weaknesses:</span>{' '}
                        {comp.perceivedWeaknesses}
                      </p>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        aria-label={`Remove ${comp.name}`}
                        className="p-1 text-[#667085] hover:text-[#B91C1C] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Analysis Output */}
      {isGenerating && !positioning ? (
        <div className="h-64 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]" />
      ) : !positioning ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <ShieldAlert className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            Positioning analysis not generated yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#667085]">
            Add any known competitors above, then run Competitive Positioning to identify
            differentiation angles and strategic risks.
          </p>
          <button
            type="button"
            onClick={() => onGenerate(competitors)}
            disabled={isGenerating}
            className="mt-5 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] cursor-pointer"
          >
            Analyze Competitive Positioning
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                Recommended Positioning Statement
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
                    positioning.verifiedExternalResearchConducted
                      ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
                  }`}
                >
                  {positioning.verifiedExternalResearchConducted
                    ? 'External Research Verified'
                    : 'No External Research Conducted'}
                </span>
                <span className="text-xs text-[#667085] tabular-nums">
                  Based on {positioning.competitorsAnalyzedCount} supplied competitor record(s)
                </span>
              </div>
            </div>
            <p className="text-base leading-relaxed text-[#172B43]">
              {positioning.positioningStatement}
            </p>
            <p className="pt-2 text-xs text-[#667085] border-t border-[#E6E1D9]">
              {positioning.dataSourceNotice}
            </p>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            {(
              [
                ['Differentiation Opportunities', positioning.differentiationOpportunities],
                ['Potential Advantages', positioning.potentialAdvantages],
                ['Potential Weaknesses', positioning.potentialWeaknesses],
                ['Competitive Risks', positioning.competitiveRisks],
              ] as const
            ).map(([title, items]) => (
              <section
                key={title}
                className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-3"
              >
                <h3 className="text-base font-semibold text-[#172B43]">{title}</h3>
                <ul className="space-y-3">
                  {items.map((item, idx) => {
                    const sourceCfg =
                      SOURCE_TYPE_CONFIG[item.sourceType ?? 'ai_hypothesis'] ??
                      SOURCE_TYPE_CONFIG.ai_hypothesis;
                    return (
                      <li
                        key={idx}
                        className="border-b border-[#E6E1D9] pb-3 last:border-b-0 last:pb-0 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-[#172B43]">{item.statement}</p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-tight whitespace-nowrap ${sourceCfg.className}`}
                            >
                              {sourceCfg.label}
                            </span>
                            <EpistemicTag basis={item.basis} />
                          </div>
                        </div>
                        {item.rationale && (
                          <p className="text-xs text-[#667085]">{item.rationale}</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
