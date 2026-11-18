import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, Play, Save } from 'lucide-react';
import type { BusinessIntake, ModuleKey, StrategyProject } from '../../types/strategy';
import { EpistemicTag } from '../ui/EpistemicTag';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

interface IdeaAnalyzerViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onUpdateIntake: (intake: BusinessIntake) => Promise<void>;
  onAnalyzeIdea: () => Promise<void>;
  onSubmitClarifications: (
    answers: { id: string; answer: string }[],
    additionalNotes?: string
  ) => Promise<void>;
  onRunFullPipeline: () => Promise<void>;
  onNavigateModule: (module: ModuleKey) => void;
}

const BUSINESS_STAGES = [
  'Idea / Concept',
  'Pre-Seed / Validation',
  'MVP / Early Traction',
  'Operating Small Business',
  'Scaling',
];

export function IdeaAnalyzerView({
  project,
  isGenerating,
  error,
  onUpdateIntake,
  onAnalyzeIdea,
  onSubmitClarifications,
  onRunFullPipeline,
  onNavigateModule,
}: IdeaAnalyzerViewProps) {
  const [intake, setIntake] = useState<BusinessIntake>(project.intake);
  const [intakeDirty, setIntakeDirty] = useState(false);
  const [savingIntake, setSavingIntake] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submittingClarifications, setSubmittingClarifications] = useState(false);

  useEffect(() => {
    setIntake(project.intake);
    setIntakeDirty(false);
    const nextAnswers: Record<string, string> = {};
    for (const q of project.ideaAnalysis?.clarificationQuestions ?? []) {
      nextAnswers[q.id] = q.answer ?? '';
    }
    setAnswers(nextAnswers);
  }, [project]);

  const handleSaveIntake = async (e: FormEvent) => {
    e.preventDefault();
    setSavingIntake(true);
    try {
      await onUpdateIntake(intake);
      setIntakeDirty(false);
    } finally {
      setSavingIntake(false);
    }
  };

  const handleClarificationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!project.ideaAnalysis) return;
    setSubmittingClarifications(true);
    try {
      const payload = project.ideaAnalysis.clarificationQuestions.map((q) => ({
        id: q.id,
        answer: answers[q.id] ?? '',
      }));
      await onSubmitClarifications(payload, additionalNotes);
      setAdditionalNotes('');
    } finally {
      setSubmittingClarifications(false);
    }
  };

  const analysis = project.ideaAnalysis;
  const answeredCount =
    analysis?.clarificationQuestions.filter((q) => (answers[q.id] ?? '').trim().length > 0)
      .length ?? 0;

  const inputClass =
    'w-full rounded-lg border border-[#E6E1D9] bg-white px-3 py-2 text-sm text-[#172B43] placeholder:text-[#98A2B3] focus:border-[#E85A32] focus:outline-none focus:ring-2 focus:ring-[#E85A32]/15';

  return (
    <div className="space-y-8">
      <ModuleStatusHeader
        stepNumber="01. Idea Analyzer"
        title="Business Idea Intake & Diagnostic"
        description="Submit core venture parameters. Gemini isolates confirmed facts from market assumptions, flags missing data, and asks targeted clarification questions."
        lastGeneratedAt={analysis?.analyzedAt}
        actionLabel={analysis ? 'Re-Analyze Business Idea' : 'Analyze Business Idea'}
        onAction={onAnalyzeIdea}
        isLoading={isGenerating}
        error={error}
      />

      {/* Business Intake Form */}
      <form
        onSubmit={handleSaveIntake}
        className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-5"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              Supplied Inputs
            </p>
            <h2 className="text-base font-semibold text-[#172B43]">
              Venture Intake Facts
            </h2>
            <p className="text-xs text-[#667085]">
              Information entered here is treated as supplied fact across all downstream modules.
            </p>
          </div>
          {intakeDirty && (
            <button
              type="submit"
              disabled={savingIntake}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E85A32] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {savingIntake ? 'Saving...' : 'Save Intake Changes'}
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Business Name
            </label>
            <input
              type="text"
              required
              value={intake.businessName}
              onChange={(e) => {
                setIntake({ ...intake, businessName: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Industry
            </label>
            <input
              type="text"
              required
              value={intake.industry}
              onChange={(e) => {
                setIntake({ ...intake, industry: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Business Stage
            </label>
            <select
              value={intake.businessStage}
              onChange={(e) => {
                setIntake({ ...intake, businessStage: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            >
              {BUSINESS_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Target Geography
            </label>
            <input
              type="text"
              required
              value={intake.targetGeography}
              onChange={(e) => {
                setIntake({ ...intake, targetGeography: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Estimated Starting Budget
            </label>
            <input
              type="text"
              required
              value={intake.estimatedStartingBudget}
              onChange={(e) => {
                setIntake({ ...intake, estimatedStartingBudget: e.target.value });
                setIntakeDirty(true);
              }}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Intended Customers
            </label>
            <input
              type="text"
              required
              value={intake.intendedCustomers}
              onChange={(e) => {
                setIntake({ ...intake, intendedCustomers: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Business Description
            </label>
            <textarea
              rows={3}
              required
              value={intake.businessDescription}
              onChange={(e) => {
                setIntake({ ...intake, businessDescription: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-xs font-medium text-[#667085]">
              Main Business Objective
            </label>
            <input
              type="text"
              required
              value={intake.mainObjective}
              onChange={(e) => {
                setIntake({ ...intake, mainObjective: e.target.value });
                setIntakeDirty(true);
              }}
              className={inputClass}
            />
          </div>
        </div>
      </form>

      {/* Diagnostic Results or Empty State */}
      {isGenerating && !analysis ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-56 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]" />
            <div className="h-56 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]" />
          </div>
        </div>
      ) : !analysis ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <HelpCircle className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            Ready to diagnose your business idea
          </h3>
          <p className="mx-auto mt-1.5 max-w-lg text-sm text-[#667085]">
            Run the Idea Analyzer to extract your core value proposition, surface unvalidated
            market assumptions, detect missing details, and generate clarification questions.
          </p>
          <button
            type="button"
            onClick={onAnalyzeIdea}
            disabled={isGenerating}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Analyze Business Idea
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Core Value Proposition */}
          <section className="rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                Core Value Proposition
              </h2>
              <EpistemicTag basis="hypothesis" />
            </div>
            <p className="text-base leading-relaxed text-[#172B43]">
              {analysis.coreValueProposition}
            </p>
          </section>

          {/* Facts vs Assumptions Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#172B43]">
                  Confirmed Facts Supplied
                </h3>
                <EpistemicTag basis="fact" />
              </div>
              <ul className="space-y-2.5">
                {analysis.suppliedFactsSummary.map((fact, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-[#172B43]"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#166534]" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#172B43]">
                  Target Market Assumptions
                </h3>
                <EpistemicTag basis="hypothesis" />
              </div>
              <ul className="space-y-3">
                {analysis.targetMarketAssumptions.map((item, idx) => (
                  <li
                    key={idx}
                    className="border-b border-[#E6E1D9] pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-[#172B43]">{item.statement}</p>
                      <EpistemicTag basis={item.basis} />
                    </div>
                    {item.rationale && (
                      <p className="mt-1 text-xs text-[#667085]">{item.rationale}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
              <h3 className="text-base font-semibold text-[#172B43]">
                Potential Customer Problems
              </h3>
              <ul className="space-y-3">
                {analysis.potentialCustomerProblems.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start justify-between gap-3 border-b border-[#E6E1D9] pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm text-[#172B43]">{item.statement}</p>
                    <EpistemicTag basis={item.basis} />
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#E6E1D9] bg-white p-6 space-y-4">
              <h3 className="text-base font-semibold text-[#172B43]">
                Missing Information & Key Business Risks
              </h3>
              {analysis.missingInformation.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#B45309]">
                    Information Gaps Detected
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-[#667085]">
                    {analysis.missingInformation.map((gap, idx) => (
                      <li key={idx}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="pt-3 space-y-3 border-t border-[#E6E1D9]">
                <p className="text-xs font-semibold text-[#667085]">Key Business Risks</p>
                {analysis.keyBusinessRisks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <div>
                      <p className="text-[#172B43]">{risk.statement}</p>
                      {risk.rationale && (
                        <p className="mt-0.5 text-xs text-[#667085]">{risk.rationale}</p>
                      )}
                    </div>
                    <EpistemicTag basis={risk.basis} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Targeted Clarification Questions Workflow */}
          <section className="rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                  Guided Refinement
                </p>
                <h2 className="text-lg font-semibold text-[#172B43]">
                  Targeted Clarification Questions
                </h2>
                <p className="text-xs text-[#667085]">
                  Answer these questions to turn unvalidated assumptions into confirmed facts before generating your downstream strategy.
                </p>
              </div>
              <span className="font-mono text-xs font-medium text-[#172B43] tabular-nums whitespace-nowrap shrink-0">
                {answeredCount} / {analysis.clarificationQuestions.length} answered
              </span>
            </div>

            <form onSubmit={handleClarificationSubmit} className="space-y-5">
              <div className="space-y-4">
                {analysis.clarificationQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-lg border border-[#E6E1D9] bg-white p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs text-[#667085]">
                      <span className="font-medium">
                        Question {idx + 1} · {q.category}
                      </span>
                      {answers[q.id]?.trim() ? (
                        <span className="font-medium text-[#166534]">Answered</span>
                      ) : (
                        <span className="font-medium text-[#B45309]">Needs Input</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#172B43]">{q.question}</p>
                    <p className="text-xs text-[#667085]">
                      Why it matters: {q.whyItMatters}
                    </p>
                    <textarea
                      rows={2}
                      value={answers[q.id] ?? ''}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Enter your answer or operational constraint..."
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              {project.additionalClarificationNotes &&
                project.additionalClarificationNotes.length > 0 && (
                  <div className="rounded-lg border border-[#E6E1D9] bg-white p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#172B43]">
                        Saved Verbatim Clarification Notes
                      </p>
                      <EpistemicTag basis="fact" />
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[#667085]">
                      {project.additionalClarificationNotes.map((note, idx) => (
                        <li key={idx} className="text-[#172B43]">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                  Additional Context or Constraints (Optional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Share any pricing targets, partner commitments, or regulatory details..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6E1D9]">
                <button
                  type="submit"
                  disabled={submittingClarifications || isGenerating}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#E6E1D9] bg-white px-4 py-2 text-sm font-medium text-[#172B43] hover:bg-[#EBE7E0] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {submittingClarifications
                    ? 'Updating Analysis...'
                    : 'Submit Clarifications & Re-Analyze'}
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigateModule('personas')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D9] bg-white px-4 py-2 text-sm font-medium text-[#172B43] hover:bg-[#EBE7E0] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Next: Customer Personas
                    <ArrowRight className="h-4 w-4 text-[#E85A32]" />
                  </button>
                  <button
                    type="button"
                    onClick={onRunFullPipeline}
                    disabled={isGenerating || submittingClarifications}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#E85A32] px-4 py-2 text-sm font-medium text-white hover:bg-[#D44A23] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Generate All Strategy Modules
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
