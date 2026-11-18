import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Circle,
  Compass,
  Download,
  FileText,
  FolderPlus,
  Grid2X2,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Milestone,
  Play,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { BusinessModelView } from './components/modules/BusinessModelView';
import { CompetitiveView } from './components/modules/CompetitiveView';
import { DashboardView } from './components/modules/DashboardView';
import { FinancialFeasibilityView } from './components/modules/FinancialFeasibilityView';
import { IdeaAnalyzerView } from './components/modules/IdeaAnalyzerView';
import { PersonasView } from './components/modules/PersonasView';
import { RoadmapView } from './components/modules/RoadmapView';
import { StrategyReportView } from './components/modules/StrategyReportView';
import { SwotView } from './components/modules/SwotView';
import { strategyApi } from './services/api';
import type {
  BusinessIntake,
  BusinessModelCanvas,
  CustomerPersona,
  ManualCompetitor,
  ModuleKey,
  StrategyProject,
  SwotAnalysis,
} from './types/strategy';
import { exportStrategyPdf } from './utils/pdfExport';
import { getProjectCompletion } from './utils/projectProgress';

const WORKSPACE_MODULES: {
  key: Exclude<ModuleKey, 'dashboard'>;
  number: string;
  label: string;
  icon: typeof Compass;
}[] = [
  { key: 'idea_analyzer', number: '01', label: 'Idea Analyzer', icon: Compass },
  { key: 'personas', number: '02', label: 'Customer Personas', icon: Users },
  { key: 'swot', number: '03', label: 'SWOT Analysis', icon: Grid2X2 },
  { key: 'business_model', number: '04', label: 'Business Model', icon: LayoutGrid },
  {
    key: 'financial_feasibility',
    number: '05',
    label: 'Financial Feasibility',
    icon: Calculator,
  },
  { key: 'competitive', number: '06', label: 'Competitive Matrix', icon: ShieldAlert },
  { key: 'roadmap', number: '07', label: 'Strategic Roadmap', icon: Milestone },
  { key: 'report', number: '08', label: 'Strategy Report', icon: FileText },
];

export default function App() {
  const [projects, setProjects] = useState<StrategyProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const [generatingModule, setGeneratingModule] = useState<
    ModuleKey | 'pipeline' | 'consistency' | null
  >(null);
  const [pipelineStepLabel, setPipelineStepLabel] = useState<string | null>(null);
  const [moduleError, setModuleError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setGlobalError(null);
    try {
      const list = await strategyApi.listProjects();
      setProjects(list);
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Unable to load strategy projects.'
      );
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  const upsertProjectInState = useCallback((updated: StrategyProject | undefined | null) => {
    if (!updated || typeof updated.id !== 'string') {
      return;
    }
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      const next = exists
        ? prev.map((p) => (p.id === updated.id ? updated : p))
        : [updated, ...prev];
      return [...next].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, []);

  const handleSelectProject = (projectId: string, targetModule: ModuleKey = 'idea_analyzer') => {
    setActiveProjectId(projectId);
    setActiveModule(targetModule);
    setModuleError(null);
    setIsMobileNavOpen(false);
  };

  const handleSelectDashboard = () => {
    setActiveModule('dashboard');
    setModuleError(null);
    setIsMobileNavOpen(false);
  };

  const handleCreateProject = async (
    intake: BusinessIntake,
    runAnalysisImmediately: boolean
  ) => {
    const created = await strategyApi.createProject(intake);
    upsertProjectInState(created);
    setActiveProjectId(created.id);
    setActiveModule('idea_analyzer');
    setModuleError(null);

    if (runAnalysisImmediately) {
      setGeneratingModule('idea_analyzer');
      void strategyApi
        .analyzeIdea(created.id)
        .then((analyzed) => {
          upsertProjectInState(analyzed);
        })
        .catch((err) => {
          setModuleError(
            err instanceof Error
              ? err.message
              : 'Project created, but initial AI analysis failed.'
          );
        })
        .finally(() => {
          setGeneratingModule(null);
        });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    await strategyApi.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      setActiveModule('dashboard');
    }
  };

  const runModuleAction = async (
    moduleKey: ModuleKey | 'consistency',
    fn: () => Promise<StrategyProject>
  ) => {
    setModuleError(null);
    setGeneratingModule(moduleKey);
    try {
      const updated = await fn();
      upsertProjectInState(updated);
      return updated;
    } catch (err) {
      setModuleError(err instanceof Error ? err.message : 'Strategy generation failed.');
      return null;
    } finally {
      setGeneratingModule(null);
    }
  };

  const handleRunFullPipeline = async () => {
    if (!activeProject) return;
    setModuleError(null);
    setGeneratingModule('pipeline');

    try {
      let current = activeProject;

      if (!current.ideaAnalysis) {
        setPipelineStepLabel('01. Analyzing Business Idea...');
        current = await strategyApi.analyzeIdea(current.id);
        upsertProjectInState(current);
      }
      if (!current.personas?.items?.length) {
        setPipelineStepLabel('02. Generating Customer Personas...');
        current = await strategyApi.generatePersonas(current.id);
        upsertProjectInState(current);
      }
      if (!current.swot) {
        setPipelineStepLabel('03. Generating SWOT Matrix...');
        current = await strategyApi.generateSwot(current.id);
        upsertProjectInState(current);
      }
      if (!current.businessModel) {
        setPipelineStepLabel('04. Designing Business Model...');
        current = await strategyApi.generateBusinessModel(current.id);
        upsertProjectInState(current);
      }
      if (!current.financialFeasibility) {
        setPipelineStepLabel('05. Analyzing Financial Feasibility...');
        current = await strategyApi.generateFinancialFeasibility(current.id);
        upsertProjectInState(current);
      }
      if (!current.competitivePositioning) {
        setPipelineStepLabel('06. Analyzing Competitive Positioning...');
        current = await strategyApi.generateCompetitive(
          current.id,
          current.manualCompetitors
        );
        upsertProjectInState(current);
      }
      if (!current.roadmap) {
        setPipelineStepLabel('07. Building Conditional Roadmap...');
        current = await strategyApi.generateRoadmap(current.id);
        upsertProjectInState(current);
      }
      if (!current.consistencyValidation) {
        setPipelineStepLabel('Auditing Cross-Module Strategy Consistency...');
        current = await strategyApi.validateConsistency(current.id);
        upsertProjectInState(current);
      }
      if (!current.executiveReport) {
        setPipelineStepLabel('08. Synthesizing Executive Report...');
        current = await strategyApi.generateExecutiveSummary(current.id);
        upsertProjectInState(current);
      }

      setActiveModule('report');
    } catch (err) {
      setModuleError(
        err instanceof Error
          ? err.message
          : 'Modular strategy pipeline paused due to an error.'
      );
    } finally {
      setGeneratingModule(null);
      setPipelineStepLabel(null);
    }
  };

  const isModuleDone = (project: StrategyProject, key: Exclude<ModuleKey, 'dashboard'>) => {
    switch (key) {
      case 'idea_analyzer':
        return Boolean(project.ideaAnalysis);
      case 'personas':
        return Boolean(project.personas?.items?.length);
      case 'swot':
        return Boolean(project.swot);
      case 'business_model':
        return Boolean(project.businessModel);
      case 'financial_feasibility':
        return Boolean(project.financialFeasibility);
      case 'competitive':
        return Boolean(project.competitivePositioning);
      case 'roadmap':
        return Boolean(project.roadmap);
      case 'report':
        return Boolean(project.executiveReport);
    }
  };

  const activeModuleMeta = WORKSPACE_MODULES.find((m) => m.key === activeModule);
  const activeCompletion = activeProject ? getProjectCompletion(activeProject) : null;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#F5F3EF] border-r border-[#E6E1D9]">
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Brand Wordmark */}
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={handleSelectDashboard}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                className="fill-[#FFF5F2] stroke-[#E85A32]"
                strokeWidth="1.5"
              />
              <path
                d="M7 15L10.5 11.5L13.5 13.5L17 8.5"
                className="stroke-[#E85A32]"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-base font-bold tracking-tight text-[#172B43] whitespace-nowrap shrink-0">
              STRATOS AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            className="rounded p-1 text-[#667085] hover:text-[#172B43] lg:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Action */}
        <button
          type="button"
          onClick={() => {
            setIsCreateModalOpen(true);
            setIsMobileNavOpen(false);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E85A32] px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <FolderPlus className="h-4 w-4" />
          New Strategy
        </button>

        {/* Primary Nav */}
        <nav className="space-y-1">
          <button
            type="button"
            onClick={handleSelectDashboard}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'dashboard'
                ? 'border border-[#E6E1D9] bg-white text-[#172B43]'
                : 'text-[#667085] hover:bg-white/60 hover:text-[#172B43]'
            }`}
          >
            <LayoutDashboard
              className={`h-4 w-4 shrink-0 ${
                activeModule === 'dashboard' ? 'text-[#E85A32]' : ''
              }`}
            />
            Dashboard
          </button>
        </nav>

        {/* Active Project Strategy Pipeline Navigation */}
        {activeProject && (
          <div className="space-y-2 border-t border-[#E6E1D9] pt-5">
            <div className="px-2 space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
                Active Workspace
              </p>
              <p className="truncate text-xs font-semibold text-[#172B43]">
                {activeProject.intake.businessName}
              </p>
              {activeCompletion && (
                <p className="font-mono text-[11px] text-[#667085] tabular-nums">
                  {activeCompletion.completedModules}/{activeCompletion.totalModules}{' '}
                  modules complete
                </p>
              )}
            </div>

            <nav className="space-y-1 pt-1">
              {WORKSPACE_MODULES.map((mod) => {
                const Icon = mod.icon;
                const done = isModuleDone(activeProject, mod.key);
                const isActive = activeModule === mod.key;
                return (
                  <button
                    key={mod.key}
                    type="button"
                    onClick={() => {
                      setActiveModule(mod.key);
                      setModuleError(null);
                      setIsMobileNavOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'border border-[#E6E1D9] bg-white text-[#172B43] font-medium'
                        : 'text-[#667085] hover:bg-white/60 hover:text-[#172B43]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-[#E85A32]' : ''
                        }`}
                      />
                      <span className="truncate whitespace-nowrap">
                        {mod.number}. {mod.label}
                      </span>
                    </span>
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#166534]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Quick Project Switcher */}
        {projects.length > 0 && (
          <div className="space-y-2 border-t border-[#E6E1D9] pt-5">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              Recent Projects
            </p>
            <div className="space-y-1">
              {projects.slice(0, 5).map((proj) => {
                const selected = proj.id === activeProjectId && activeModule !== 'dashboard';
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() =>
                      handleSelectProject(
                        proj.id,
                        activeModule === 'dashboard' ? 'idea_analyzer' : activeModule
                      )
                    }
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                      selected
                        ? 'border border-[#E6E1D9] bg-white text-[#172B43] font-medium'
                        : 'text-[#667085] hover:bg-white/60 hover:text-[#172B43]'
                    }`}
                  >
                    <span className="truncate">{proj.intake.businessName}</span>
                    <span className="font-mono text-[11px] text-[#667085] tabular-nums shrink-0">
                      {getProjectCompletion(proj).percentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div className="border-t border-[#E6E1D9] px-5 py-3 text-[11px] text-[#667085]">
        STRATOS AI · Strategy Studio
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white text-[#172B43]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-[264px] shrink-0 lg:block sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#172B43]/35"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative z-50 w-72 max-w-[85vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Breadcrumbs left, 1–2 single-line primary actions right */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-8 border-b border-[#E6E1D9] bg-white/95 px-6 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-[#E6E1D9] bg-white p-2 text-[#172B43] hover:bg-[#F5F3EF] lg:hidden cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs sm:text-sm min-w-0"
            >
              <button
                type="button"
                onClick={handleSelectDashboard}
                className="text-[#667085] hover:text-[#172B43] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Projects
              </button>
              {activeModule !== 'dashboard' && activeProject ? (
                <>
                  <span className="text-[#CBD5E1]" aria-hidden="true">
                    /
                  </span>
                  <span className="truncate font-medium text-[#172B43] max-w-[160px] sm:max-w-xs">
                    {activeProject.intake.businessName}
                  </span>
                  {activeModuleMeta && (
                    <>
                      <span className="text-[#CBD5E1]" aria-hidden="true">
                        /
                      </span>
                      <span className="font-medium text-[#E85A32] whitespace-nowrap shrink-0">
                        {activeModuleMeta.label}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="text-[#CBD5E1]" aria-hidden="true">
                    /
                  </span>
                  <span className="font-medium text-[#172B43] whitespace-nowrap shrink-0">
                    Overview
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeProject && activeModule !== 'dashboard' ? (
              <>
                <button
                  type="button"
                  onClick={handleRunFullPipeline}
                  disabled={generatingModule !== null}
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#E6E1D9] bg-white px-3.5 py-2 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 text-[#E85A32]" />
                  {generatingModule === 'pipeline'
                    ? 'Running Pipeline...'
                    : 'Generate Full Strategy'}
                </button>
                <button
                  type="button"
                  onClick={() => exportStrategyPdf(activeProject)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E85A32] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E85A32] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                New Strategy
              </button>
            )}
          </div>
        </header>

        {/* Pipeline Progress Banner */}
        {pipelineStepLabel && (
          <div className="border-b border-[#F6C8B8] bg-[#FFF5F2] px-6 py-2.5 text-xs text-[#172B43] flex items-center justify-between gap-4">
            <span className="font-medium">
              Executing modular Gemini strategy pipeline: {pipelineStepLabel}
            </span>
            <span className="font-mono text-[#E85A32]">Sequential Step</span>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {globalError && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]"
              >
                {globalError}
              </div>
            )}

            {activeModule === 'dashboard' || !activeProject ? (
              <DashboardView
                projects={projects}
                isLoading={isLoadingProjects}
                onCreateNew={() => setIsCreateModalOpen(true)}
                onSelectProject={handleSelectProject}
                onDeleteProject={handleDeleteProject}
              />
            ) : activeModule === 'idea_analyzer' ? (
              <IdeaAnalyzerView
                project={activeProject}
                isGenerating={
                  generatingModule === 'idea_analyzer' || generatingModule === 'pipeline'
                }
                error={moduleError}
                onUpdateIntake={async (intake) => {
                  try {
                    setModuleError(null);
                    const updated = await strategyApi.updateProject(activeProject.id, {
                      intake,
                    });
                    upsertProjectInState(updated);
                  } catch (err) {
                    setModuleError(
                      err instanceof Error ? err.message : 'Failed to save intake changes.'
                    );
                  }
                }}
                onAnalyzeIdea={async () => {
                  await runModuleAction('idea_analyzer', () =>
                    strategyApi.analyzeIdea(activeProject.id)
                  );
                }}
                onSubmitClarifications={async (answers, additionalNotes) => {
                  await runModuleAction('idea_analyzer', () =>
                    strategyApi.refineIdea(activeProject.id, answers, additionalNotes)
                  );
                }}
                onRunFullPipeline={handleRunFullPipeline}
                onNavigateModule={(mod) => setActiveModule(mod)}
              />
            ) : activeModule === 'personas' ? (
              <PersonasView
                project={activeProject}
                isGenerating={
                  generatingModule === 'personas' || generatingModule === 'pipeline'
                }
                error={moduleError}
                onGenerate={async () => {
                  await runModuleAction('personas', () =>
                    strategyApi.generatePersonas(activeProject.id)
                  );
                }}
                onSavePersonas={async (items: CustomerPersona[]) => {
                  try {
                    setModuleError(null);
                    const updated = await strategyApi.updateProject(activeProject.id, {
                      personas: {
                        generatedAt:
                          activeProject.personas?.generatedAt ?? new Date().toISOString(),
                        items,
                      },
                    });
                    upsertProjectInState(updated);
                  } catch (err) {
                    setModuleError(
                      err instanceof Error ? err.message : 'Failed to save persona edits.'
                    );
                  }
                }}
              />
            ) : activeModule === 'swot' ? (
              <SwotView
                project={activeProject}
                isGenerating={
                  generatingModule === 'swot' || generatingModule === 'pipeline'
                }
                error={moduleError}
                onGenerate={async () => {
                  await runModuleAction('swot', () =>
                    strategyApi.generateSwot(activeProject.id)
                  );
                }}
                onSaveSwot={async (swot: SwotAnalysis) => {
                  try {
                    setModuleError(null);
                    const updated = await strategyApi.updateProject(activeProject.id, {
                      swot,
                    });
                    upsertProjectInState(updated);
                  } catch (err) {
                    setModuleError(
                      err instanceof Error ? err.message : 'Failed to save SWOT changes.'
                    );
                  }
                }}
              />
            ) : activeModule === 'business_model' ? (
              <BusinessModelView
                project={activeProject}
                isGenerating={
                  generatingModule === 'business_model' || generatingModule === 'pipeline'
                }
                error={moduleError}
                onGenerate={async () => {
                  await runModuleAction('business_model', () =>
                    strategyApi.generateBusinessModel(activeProject.id)
                  );
                }}
                onSaveBusinessModel={async (businessModel: BusinessModelCanvas) => {
                  try {
                    setModuleError(null);
                    const updated = await strategyApi.updateProject(activeProject.id, {
                      businessModel,
                    });
                    upsertProjectInState(updated);
                  } catch (err) {
                    setModuleError(
                      err instanceof Error
                        ? err.message
                        : 'Failed to save Business Model changes.'
                    );
                  }
                }}
              />
            ) : activeModule === 'financial_feasibility' ? (
              <FinancialFeasibilityView
                project={activeProject}
                isGenerating={
                  generatingModule === 'financial_feasibility' ||
                  generatingModule === 'pipeline'
                }
                error={moduleError}
                onGenerate={async () => {
                  await runModuleAction('financial_feasibility', () =>
                    strategyApi.generateFinancialFeasibility(activeProject.id)
                  );
                }}
              />
            ) : activeModule === 'competitive' ? (
              <CompetitiveView
                project={activeProject}
                isGenerating={
                  generatingModule === 'competitive' || generatingModule === 'pipeline'
                }
                error={moduleError}
                onSaveCompetitors={async (manualCompetitors: ManualCompetitor[]) => {
                  try {
                    setModuleError(null);
                    const updated = await strategyApi.updateProject(activeProject.id, {
                      manualCompetitors,
                    });
                    upsertProjectInState(updated);
                  } catch (err) {
                    setModuleError(
                      err instanceof Error
                        ? err.message
                        : 'Failed to save competitor changes.'
                    );
                  }
                }}
                onGenerate={async (manualCompetitors: ManualCompetitor[]) => {
                  await runModuleAction('competitive', () =>
                    strategyApi.generateCompetitive(activeProject.id, manualCompetitors)
                  );
                }}
              />
            ) : activeModule === 'roadmap' ? (
              <RoadmapView
                project={activeProject}
                isGenerating={
                  generatingModule === 'roadmap' || generatingModule === 'pipeline'
                }
                error={moduleError}
                onGenerate={async () => {
                  await runModuleAction('roadmap', () =>
                    strategyApi.generateRoadmap(activeProject.id)
                  );
                }}
              />
            ) : (
              <StrategyReportView
                project={activeProject}
                isGenerating={
                  generatingModule === 'report' || generatingModule === 'pipeline'
                }
                isValidatingConsistency={generatingModule === 'consistency'}
                error={moduleError}
                onValidateConsistency={async () => {
                  await runModuleAction('consistency', () =>
                    strategyApi.validateConsistency(activeProject.id)
                  );
                }}
                onGenerateExecutiveSummary={async () => {
                  await runModuleAction('report', () =>
                    strategyApi.generateExecutiveSummary(activeProject.id)
                  );
                }}
                onRunFullPipeline={handleRunFullPipeline}
                onNavigateModule={(mod) => setActiveModule(mod)}
              />
            )}
          </div>
        </main>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
