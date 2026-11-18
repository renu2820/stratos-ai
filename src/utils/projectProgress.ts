import type { StrategyProject } from '../types/strategy';

export interface ProjectCompletionStats {
  completedModules: number;
  totalModules: number;
  percentage: number;
  checklist: {
    key: string;
    label: string;
    done: boolean;
  }[];
}

export function getProjectCompletion(project: StrategyProject): ProjectCompletionStats {
  const checklist = [
    { key: 'idea_analyzer', label: 'Idea Analysis', done: Boolean(project.ideaAnalysis) },
    { key: 'personas', label: 'Customer Personas', done: Boolean(project.personas?.items?.length) },
    { key: 'swot', label: 'SWOT Analysis', done: Boolean(project.swot) },
    { key: 'business_model', label: 'Business Model', done: Boolean(project.businessModel) },
    {
      key: 'financial_feasibility',
      label: 'Financial Feasibility',
      done: Boolean(project.financialFeasibility),
    },
    { key: 'competitive', label: 'Competitive Matrix', done: Boolean(project.competitivePositioning) },
    { key: 'roadmap', label: 'Strategic Roadmap', done: Boolean(project.roadmap) },
    { key: 'report', label: 'Executive Summary', done: Boolean(project.executiveReport) },
  ];

  const completedModules = checklist.filter((c) => c.done).length;
  const totalModules = checklist.length;
  const percentage = Math.round((completedModules / totalModules) * 100);

  return { completedModules, totalModules, percentage, checklist };
}

export function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
