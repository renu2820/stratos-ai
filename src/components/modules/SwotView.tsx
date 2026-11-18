import { useState, type FormEvent } from 'react';
import { Grid2X2, Plus, Trash2 } from 'lucide-react';
import type { StrategyProject, SwotAnalysis, SwotEntry } from '../../types/strategy';
import { EpistemicTag } from '../ui/EpistemicTag';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

interface SwotViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => Promise<void>;
  onSaveSwot: (swot: SwotAnalysis) => Promise<void>;
}

type QuadrantKey = 'strengths' | 'weaknesses' | 'opportunities' | 'threats';

const QUADRANTS: {
  key: QuadrantKey;
  title: string;
  subtitle: string;
  accentClass: string;
}[] = [
  {
    key: 'strengths',
    title: 'Strengths',
    subtitle: 'Internal advantages and confirmed assets',
    accentClass: 'text-[#166534]',
  },
  {
    key: 'weaknesses',
    title: 'Weaknesses',
    subtitle: 'Internal constraints, budget limits, and capability gaps',
    accentClass: 'text-[#B45309]',
  },
  {
    key: 'opportunities',
    title: 'Opportunities',
    subtitle: 'External market openings and structural tailwinds',
    accentClass: 'text-[#E85A32]',
  },
  {
    key: 'threats',
    title: 'Threats',
    subtitle: 'External execution risks and competitive pressures',
    accentClass: 'text-[#991B1B]',
  },
];

export function SwotView({
  project,
  isGenerating,
  error,
  onGenerate,
  onSaveSwot,
}: SwotViewProps) {
  const swot = project.swot;
  const [addingQuadrant, setAddingQuadrant] = useState<QuadrantKey | null>(null);
  const [newPoint, setNewPoint] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newImpact, setNewImpact] = useState<'high' | 'medium' | 'low'>('medium');

  const handleAddItem = async (e: FormEvent, quadrant: QuadrantKey) => {
    e.preventDefault();
    if (!swot || !newPoint.trim()) return;
    const entry: SwotEntry = {
      id: `swot-custom-${Date.now()}`,
      point: newPoint.trim(),
      rationale: newRationale.trim() || 'Added directly by founder.',
      basis: 'fact',
      impact: newImpact,
    };
    await onSaveSwot({
      ...swot,
      [quadrant]: [...swot[quadrant], entry],
    });
    setNewPoint('');
    setNewRationale('');
    setAddingQuadrant(null);
  };

  const handleRemoveItem = async (quadrant: QuadrantKey, id: string) => {
    if (!swot) return;
    await onSaveSwot({
      ...swot,
      [quadrant]: swot[quadrant].filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <ModuleStatusHeader
        stepNumber="03. SWOT Analysis"
        title="Strategic SWOT Matrix"
        description="Evaluates internal strengths and weaknesses alongside external opportunities and threats, providing explicit rationale and separating supplied facts from hypotheses."
        lastGeneratedAt={swot?.generatedAt}
        actionLabel={swot ? 'Regenerate SWOT' : 'Generate SWOT Analysis'}
        onAction={onGenerate}
        isLoading={isGenerating}
        error={error}
      />

      {isGenerating && !swot ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]"
            />
          ))}
        </div>
      ) : !swot ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <Grid2X2 className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            SWOT Matrix not generated yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#667085]">
            Generate a 4-quadrant strategic assessment grounded in your budget, stage, and
            clarification answers.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="mt-5 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] cursor-pointer"
          >
            Generate SWOT Analysis
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {QUADRANTS.map((q) => (
            <section
              key={q.key}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E6E1D9] bg-white"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#E6E1D9] bg-[#F5F3EF] px-6 py-4">
                <div>
                  <h2 className={`text-base font-semibold ${q.accentClass}`}>
                    {q.title}
                  </h2>
                  <p className="text-xs text-[#667085]">{q.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAddingQuadrant(addingQuadrant === q.key ? null : q.key)
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-[#E6E1D9] bg-white px-2.5 py-1 text-xs font-medium text-[#172B43] hover:bg-[#EBE7E0] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="h-3 w-3 text-[#E85A32]" />
                  Add
                </button>
              </div>

              <div className="p-6">
                {addingQuadrant === q.key && (
                  <form
                    onSubmit={(e) => handleAddItem(e, q.key)}
                    className="mb-4 space-y-2.5 rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-3.5"
                  >
                    <input
                      type="text"
                      required
                      value={newPoint}
                      onChange={(e) => setNewPoint(e.target.value)}
                      placeholder={`Add ${q.title.toLowerCase()} point...`}
                      className="w-full rounded border border-[#E6E1D9] bg-white px-2.5 py-1.5 text-sm text-[#172B43] focus:border-[#E85A32] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newRationale}
                      onChange={(e) => setNewRationale(e.target.value)}
                      placeholder="Supporting rationale..."
                      className="w-full rounded border border-[#E6E1D9] bg-white px-2.5 py-1.5 text-xs text-[#172B43] focus:border-[#E85A32] focus:outline-none"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={newImpact}
                        onChange={(e) =>
                          setNewImpact(e.target.value as 'high' | 'medium' | 'low')
                        }
                        className="rounded border border-[#E6E1D9] bg-white px-2 py-1 text-xs text-[#172B43]"
                      >
                        <option value="high">High Impact</option>
                        <option value="medium">Medium Impact</option>
                        <option value="low">Low Impact</option>
                      </select>
                      <button
                        type="submit"
                        className="rounded bg-[#E85A32] px-3 py-1 text-xs font-medium text-white hover:bg-[#D44A23] cursor-pointer"
                      >
                        Save Fact
                      </button>
                    </div>
                  </form>
                )}

                <ul className="divide-y divide-[#E6E1D9]">
                  {swot[q.key].map((entry) => (
                    <li key={entry.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[#172B43]">
                          {entry.point}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(q.key, entry.id)}
                          aria-label="Remove SWOT item"
                          className="p-1 text-[#667085] hover:text-[#B91C1C] shrink-0 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs leading-relaxed text-[#667085]">
                        {entry.rationale}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5 text-xs text-[#667085]">
                        <EpistemicTag basis={entry.basis} />
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">Impact: {entry.impact}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
