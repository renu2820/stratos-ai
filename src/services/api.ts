import type {
  BusinessIntake,
  ManualCompetitor,
  StrategyProject,
} from '../types/strategy';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  const rawText = await res.text();
  let parsed: unknown = null;

  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}.`);
      }
      throw new Error(
        'Received an unexpected non-JSON response from the server. Please retry.'
      );
    }
  }

  if (!res.ok) {
    const errMessage =
      typeof parsed === 'object' &&
      parsed !== null &&
      'error' in parsed &&
      typeof (parsed as { error?: unknown }).error === 'string'
        ? (parsed as { error: string }).error
        : `Request failed with status ${res.status}`;
    throw new Error(errMessage);
  }

  if (parsed === null || typeof parsed !== 'object') {
    throw new Error('Server returned an empty response.');
  }

  return parsed as T;
}

function assertProjectResponse(data: { project?: StrategyProject }): StrategyProject {
  if (!data?.project || typeof data.project.id !== 'string') {
    throw new Error('Server response was missing valid project data.');
  }
  return data.project;
}

export const strategyApi = {
  async listProjects(): Promise<StrategyProject[]> {
    const data = await requestJson<{ projects?: StrategyProject[] }>('/api/projects');
    if (!Array.isArray(data?.projects)) {
      throw new Error('Server response was missing the projects list.');
    }
    return data.projects;
  },

  async getProject(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(`/api/projects/${id}`);
    return assertProjectResponse(data);
  },

  async createProject(intake: BusinessIntake): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(intake),
    });
    return assertProjectResponse(data);
  },

  async updateProject(
    id: string,
    patch: Partial<StrategyProject>
  ): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return assertProjectResponse(data);
  },

  async deleteProject(id: string): Promise<void> {
    await requestJson<{ ok: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async analyzeIdea(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/analyze-idea`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async refineIdea(
    id: string,
    answers: { id: string; answer: string }[],
    additionalNotes?: string
  ): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/refine-idea`,
      {
        method: 'POST',
        body: JSON.stringify({ answers, additionalNotes }),
      }
    );
    return assertProjectResponse(data);
  },

  async generatePersonas(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/personas`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async generateSwot(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/swot`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async generateBusinessModel(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/business-model`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async generateFinancialFeasibility(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/financial-feasibility`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async generateCompetitive(
    id: string,
    manualCompetitors?: ManualCompetitor[]
  ): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/competitive`,
      {
        method: 'POST',
        body: JSON.stringify({ manualCompetitors }),
      }
    );
    return assertProjectResponse(data);
  },

  async generateRoadmap(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/roadmap`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async validateConsistency(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/validate-consistency`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },

  async generateExecutiveSummary(id: string): Promise<StrategyProject> {
    const data = await requestJson<{ project?: StrategyProject }>(
      `/api/projects/${id}/generate/executive-summary`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    return assertProjectResponse(data);
  },
};
