import { Milestone } from 'lucide-react';
import type { StrategyProject } from '../../types/strategy';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

interface RoadmapViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => Promise<void>;
}

export function RoadmapView({
  project,
  isGenerating,
  error,
  onGenerate,
}: RoadmapViewProps) {
  const roadmap = project.roadmap;

  return (
    <div className="space-y-6">
      <ModuleStatusHeader
        stepNumber="07. Strategic Roadmap"
        title="Phased Execution Roadmap"
        description="Four-stage execution plan spanning Initial Validation, Planning & Preparation, Launch, and Growth—with explicit entry gates and measurable milestone triggers."
        lastGeneratedAt={roadmap?.generatedAt}
        actionLabel={roadmap ? 'Regenerate Roadmap' : 'Generate Strategic Roadmap'}
        onAction={onGenerate}
        isLoading={isGenerating}
        error={error}
      />

      {isGenerating && !roadmap ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-48 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]"
            />
          ))}
        </div>
      ) : !roadmap ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <Milestone className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            Strategic Roadmap not generated yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#667085]">
            Generate a sequenced 4-phase action plan with entry gates, conditional milestone
            triggers, deliverables, and measurable success indicators.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="mt-5 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] cursor-pointer"
          >
            Generate Strategic Roadmap
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {roadmap.phases.map((phase, index) => {
            const entryConditions = phase.entryConditions ?? [];
            const conditionalTriggers = phase.conditionalTriggers ?? [];
            return (
              <section
                key={phase.phaseKey}
                className="overflow-hidden rounded-xl border border-[#E6E1D9] bg-white"
              >
                <div className="flex flex-col gap-2 border-b border-[#E6E1D9] bg-[#F5F3EF] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#F6C8B8] bg-[#FFF5F2] font-mono text-xs font-semibold text-[#E85A32] tabular-nums">
                      0{index + 1}
                    </span>
                    <h2 className="text-lg font-semibold text-[#172B43]">
                      {phase.phaseTitle}
                    </h2>
                  </div>
                  <span className="font-mono text-xs font-medium text-[#667085] tabular-nums">
                    Timeframe: {phase.timeframe}
                  </span>
                </div>

                {(entryConditions.length > 0 || conditionalTriggers.length > 0) && (
                  <div className="border-b border-[#E6E1D9] bg-[#FAF9F6] px-6 py-4 grid gap-4 md:grid-cols-2">
                    {entryConditions.length > 0 && (
                      <div className="space-y-1.5">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#B45309]">
                          Entry Gates (Prerequisites to Start Phase)
                        </h3>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-[#172B43]">
                          {entryConditions.map((gate, i) => (
                            <li key={i}>{gate}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {conditionalTriggers.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                          Conditional Milestone Triggers
                        </h3>
                        <div className="space-y-2">
                          {conditionalTriggers.map((trig, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-[#E6E1D9] bg-white p-2.5 text-xs space-y-1"
                            >
                              <p className="text-[#172B43]">
                                <span className="font-semibold text-[#E85A32]">IF:</span>{' '}
                                {trig.condition}
                              </p>
                              <p className="text-[#172B43]">
                                <span className="font-semibold text-[#166534]">THEN:</span>{' '}
                                {trig.targetMilestone}
                              </p>
                              <p className="font-mono text-[11px] text-[#667085]">
                                Gate Metric: {trig.metricThreshold}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                      Objectives
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-[#172B43]">
                      {phase.objectives.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                      Key Activities
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-[#172B43]">
                      {phase.activities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                      Deliverables
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-[#172B43]">
                      {phase.deliverables.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#B45309]">
                      Dependencies
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-[#667085]">
                      {phase.dependencies.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#166534]">
                      Measurable Success Indicators (Target Criteria)
                    </h3>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-[#172B43]">
                      {phase.successIndicators.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
