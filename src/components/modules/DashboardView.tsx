import { useMemo, useState } from 'react';
import {
  ArrowRight,
  FileText,
  FolderPlus,
  Search,
  Trash2,
} from 'lucide-react';
import type { ModuleKey, ProjectStatus, StrategyProject } from '../../types/strategy';
import { formatShortDate, getProjectCompletion } from '../../utils/projectProgress';

interface DashboardViewProps {
  projects: StrategyProject[];
  isLoading: boolean;
  onCreateNew: () => void;
  onSelectProject: (projectId: string, targetModule?: ModuleKey) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
}

const STATUS_FILTERS: ('All' | ProjectStatus)[] = [
  'All',
  'Draft',
  'Clarifying',
  'In Progress',
  'Complete',
];

export function DashboardView({
  projects,
  isLoading,
  onCreateNew,
  onSelectProject,
  onDeleteProject,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.intake.businessName.toLowerCase().includes(q) ||
        p.intake.industry.toLowerCase().includes(q) ||
        p.intake.targetGeography.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [projects, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = projects.length;
    const completedReports = projects.filter((p) => p.status === 'Complete').length;
    const inProgress = projects.filter(
      (p) => p.status === 'In Progress' || p.status === 'Clarifying'
    ).length;
    const totalModulesGenerated = projects.reduce(
      (acc, p) => acc + getProjectCompletion(p).completedModules,
      0
    );
    return { total, completedReports, inProgress, totalModulesGenerated };
  }, [projects]);

  const savedReports = useMemo(() => {
    return projects.filter(
      (p) => p.executiveReport || getProjectCompletion(p).completedModules >= 2
    );
  }, [projects]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteProject(id);
    } finally {
      setDeletingId(null);
    }
  };

  const renderStatusText = (status: ProjectStatus) => {
    switch (status) {
      case 'Complete':
        return 'text-[#166534]';
      case 'Clarifying':
        return 'text-[#B45309]';
      case 'In Progress':
        return 'text-[#E85A32]';
      default:
        return 'text-[#667085]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Editorial Warm Ivory Welcome Banner */}
      <section className="flex flex-col gap-6 rounded-xl border border-[#E6E1D9] bg-[#F5F3EF] p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div className="max-w-2xl space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
            STRATOS AI Strategy Workspace
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#172B43] sm:text-3xl">
            Transform early-stage venture ideas into evidence-grounded business strategies
          </h1>
          <p className="text-sm leading-relaxed text-[#667085]">
            Submit your concept, resolve AI-identified information gaps through targeted
            clarification questions, and build modular customer personas, SWOT matrices,
            business models, and actionable roadmaps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D44A23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85A32] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderPlus className="h-4 w-4" />
            Create New Strategy
          </button>
        </div>
      </section>

      {/* Portfolio Metrics Strip */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E6E1D9] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Strategy Projects
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#172B43] tabular-nums">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6E1D9] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Active Workflows
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#172B43] tabular-nums">
            {stats.inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6E1D9] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Completed Reports
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#172B43] tabular-nums">
            {stats.completedReports}
          </p>
        </div>
        <div className="rounded-xl border border-[#E6E1D9] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
            Modules Generated
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#172B43] tabular-nums">
            {stats.totalModulesGenerated}
          </p>
        </div>
      </section>

      {/* Recent Strategy Projects + Saved Strategy Reports */}
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                Portfolio
              </p>
              <h2 className="text-lg font-semibold text-[#172B43]">
                Recent Strategy Projects
              </h2>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#667085]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-48 rounded-lg border border-[#E6E1D9] bg-white py-1.5 pl-8 pr-3 text-xs text-[#172B43] placeholder:text-[#98A2B3] focus:border-[#E85A32] focus:outline-none sm:w-56"
              />
            </div>
          </div>

          {/* Segmented status filter */}
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[#E6E1D9] bg-[#F5F3EF] p-1">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#E85A32] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#172B43]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-32 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]"
                />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/60 p-8 text-center">
              <p className="text-sm font-medium text-[#172B43]">
                No matching strategy projects
              </p>
              <p className="mt-1 text-xs text-[#667085]">
                Create a new business strategy project or clear your active search filters.
              </p>
              <button
                type="button"
                onClick={onCreateNew}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#E85A32] px-4 py-2 text-xs font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Create New Strategy
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => {
                const progress = getProjectCompletion(project);
                return (
                  <article
                    key={project.id}
                    className="rounded-xl border border-[#E6E1D9] bg-white p-5 transition-colors hover:border-[#D3CBC0]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base font-semibold text-[#172B43] truncate">
                            {project.intake.businessName}
                          </h3>
                          {project.isDemo && (
                            <span className="rounded border border-[#FCD34D] bg-[#FFFBEB] px-1.5 py-0.5 text-[11px] font-medium text-[#B45309] whitespace-nowrap shrink-0">
                              Demo Data
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
                          <span>{project.intake.industry}</span>
                          <span aria-hidden="true">·</span>
                          <span>{project.intake.businessStage}</span>
                          <span aria-hidden="true">·</span>
                          <span className={`font-medium ${renderStatusText(project.status)}`}>
                            Status: {project.status}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            Updated {formatShortDate(project.updatedAt)}
                          </span>
                        </div>

                        <p className="line-clamp-2 text-sm text-[#667085] pt-1">
                          {project.intake.businessDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectProject(project.id, 'idea_analyzer')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D9] bg-white px-3.5 py-2 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Open Workspace
                          <ArrowRight className="h-3.5 w-3.5 text-[#E85A32]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          disabled={deletingId === project.id}
                          aria-label={`Delete ${project.intake.businessName}`}
                          className="rounded-lg border border-[#E6E1D9] bg-white p-2 text-[#667085] hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#B91C1C] transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Strategy Completion Progress */}
                    <div className="mt-4 pt-4 border-t border-[#E6E1D9]">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[#667085]">
                          Strategy Completion ({progress.completedModules} of{' '}
                          {progress.totalModules} modules)
                        </span>
                        <span className="font-mono font-medium text-[#172B43] tabular-nums">
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F5F3EF]">
                        <div
                          className="h-full rounded-full bg-[#E85A32] transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Access to Saved Reports */}
        <aside className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              Dossiers
            </p>
            <h2 className="text-lg font-semibold text-[#172B43]">
              Saved Strategy Reports
            </h2>
          </div>

          <div className="rounded-xl border border-[#E6E1D9] bg-white divide-y divide-[#E6E1D9]">
            {savedReports.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="mx-auto h-6 w-6 text-[#667085]" />
                <p className="mt-2 text-sm font-medium text-[#172B43]">
                  No compiled reports yet
                </p>
                <p className="mt-1 text-xs text-[#667085]">
                  Generate at least two strategy modules in a project to view and export its report.
                </p>
              </div>
            ) : (
              savedReports.map((project) => {
                const progress = getProjectCompletion(project);
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-3 p-4 hover:bg-[#F5F3EF]/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#172B43]">
                        {project.intake.businessName}
                      </p>
                      <p className="mt-0.5 text-xs text-[#667085] tabular-nums">
                        {progress.percentage}% ready · {formatShortDate(project.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectProject(project.id, 'report')}
                      className="rounded-lg border border-[#E6E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Open Report
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
