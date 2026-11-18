import crypto from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import { ThinkingLevel } from '@google/genai';
import { formatGeminiApiError, generateStructuredModule } from './geminiClient.ts';
import {
  buildBusinessModelPrompt,
  buildCompetitivePrompt,
  buildConsistencyValidationPrompt,
  buildExecutiveSummaryPrompt,
  buildFinancialFeasibilityPrompt,
  buildIdeaAnalysisPrompt,
  buildPersonasPrompt,
  buildRoadmapPrompt,
  buildSwotPrompt,
} from './prompts.ts';
import {
  businessIntakeSchema,
  businessModelOutputSchema,
  clarificationAnswersSchema,
  competitiveOutputSchema,
  consistencyValidationOutputSchema,
  executiveSummaryOutputSchema,
  financialFeasibilityOutputSchema,
  ideaAnalysisOutputSchema,
  manualCompetitorSchema,
  personasOutputSchema,
  roadmapOutputSchema,
  swotOutputSchema,
} from './schemas.ts';
import { deleteProject, getProject, listProjects, saveProject } from './storage.ts';
import type { CompetitiveInsightItem, StrategyProject } from '../src/types/strategy.ts';

export const apiRouter = Router();

function enforceCompetitiveSourceIntegrity(
  items: CompetitiveInsightItem[]
): CompetitiveInsightItem[] {
  // No external research integration is currently connected; downgrade any hallucinated verified_external label.
  return items.map((item) => ({
    ...item,
    sourceType: item.sourceType === 'verified_external' ? 'ai_hypothesis' : item.sourceType,
  }));
}

apiRouter.get('/projects', (_req: Request, res: Response) => {
  try {
    const projects = listProjects();
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to load projects.' });
  }
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }
  res.json({ project });
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const parsed = businessIntakeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Please check the business intake fields.',
      details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  const now = new Date().toISOString();
  const project: StrategyProject = {
    id: `strat-${crypto.randomUUID().slice(0, 8)}`,
    isDemo: false,
    createdAt: now,
    updatedAt: now,
    status: 'Draft',
    intake: parsed.data,
    clarificationsSubmitted: false,
    additionalClarificationNotes: [],
    manualCompetitors: [],
  };

  const saved = saveProject(project);
  res.status(201).json({ project: saved });
});

apiRouter.patch('/projects/:id', (req: Request, res: Response) => {
  const existing = getProject(String(req.params.id));
  if (!existing) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  const body = req.body as Partial<StrategyProject>;

  if (body.intake) {
    const parsedIntake = businessIntakeSchema.safeParse(body.intake);
    if (!parsedIntake.success) {
      res.status(400).json({
        error: 'Invalid business intake data.',
        details: parsedIntake.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
      return;
    }
    existing.intake = parsedIntake.data;
  }

  if (body.manualCompetitors) {
    const validated = body.manualCompetitors.map((c) => manualCompetitorSchema.parse(c));
    existing.manualCompetitors = validated;
  }

  if (body.ideaAnalysis !== undefined) existing.ideaAnalysis = body.ideaAnalysis;
  if (body.additionalClarificationNotes !== undefined) {
    existing.additionalClarificationNotes = body.additionalClarificationNotes;
  }
  if (body.personas !== undefined) existing.personas = body.personas;
  if (body.swot !== undefined) existing.swot = body.swot;
  if (body.businessModel !== undefined) existing.businessModel = body.businessModel;
  if (body.financialFeasibility !== undefined) {
    existing.financialFeasibility = body.financialFeasibility;
  }
  if (body.competitivePositioning !== undefined) {
    existing.competitivePositioning = body.competitivePositioning;
  }
  if (body.roadmap !== undefined) existing.roadmap = body.roadmap;
  if (body.consistencyValidation !== undefined) {
    existing.consistencyValidation = body.consistencyValidation;
  }
  if (body.executiveReport !== undefined) existing.executiveReport = body.executiveReport;
  if (typeof body.clarificationsSubmitted === 'boolean') {
    existing.clarificationsSubmitted = body.clarificationsSubmitted;
  }

  const saved = saveProject(existing);
  res.json({ project: saved });
});

apiRouter.delete('/projects/:id', (req: Request, res: Response) => {
  const deleted = deleteProject(String(req.params.id));
  if (!deleted) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }
  res.json({ ok: true });
});

apiRouter.post('/projects/:id/analyze-idea', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildIdeaAnalysisPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: ideaAnalysisOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.ideaAnalysis = {
      analyzedAt: new Date().toISOString(),
      coreValueProposition: result.coreValueProposition,
      suppliedFactsSummary: result.suppliedFactsSummary,
      targetMarketAssumptions: result.targetMarketAssumptions,
      potentialCustomerProblems: result.potentialCustomerProblems,
      missingInformation: result.missingInformation,
      clarificationQuestions: result.clarificationQuestions.map((q) => ({
        ...q,
        answer: '',
      })),
      keyBusinessRisks: result.keyBusinessRisks,
    };
    project.clarificationsSubmitted = false;

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/refine-idea', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }
  if (!project.ideaAnalysis) {
    res.status(400).json({ error: 'Run initial Idea Analysis before submitting clarifications.' });
    return;
  }

  const parsed = clarificationAnswersSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid clarification answers payload.' });
    return;
  }

  const answerMap = new Map(parsed.data.answers.map((a) => [a.id, a.answer]));
  project.ideaAnalysis = {
    ...project.ideaAnalysis,
    clarificationQuestions: project.ideaAnalysis.clarificationQuestions.map((q) => ({
      ...q,
      answer: answerMap.get(q.id) ?? q.answer,
    })),
  };

  // Persist exact additional notes verbatim so every downstream module receives them
  const trimmedNote = parsed.data.additionalNotes?.trim();
  if (trimmedNote) {
    const existingNotes = project.additionalClarificationNotes ?? [];
    if (!existingNotes.includes(trimmedNote)) {
      project.additionalClarificationNotes = [...existingNotes, trimmedNote];
    }
  }

  project.clarificationsSubmitted = true;

  try {
    const template = buildIdeaAnalysisPrompt(project);
    const refined = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: ideaAnalysisOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    const existingAnswered = project.ideaAnalysis.clarificationQuestions;
    project.ideaAnalysis = {
      analyzedAt: new Date().toISOString(),
      coreValueProposition: refined.coreValueProposition,
      suppliedFactsSummary: refined.suppliedFactsSummary,
      targetMarketAssumptions: refined.targetMarketAssumptions,
      potentialCustomerProblems: refined.potentialCustomerProblems,
      missingInformation: refined.missingInformation,
      clarificationQuestions: existingAnswered,
      keyBusinessRisks: refined.keyBusinessRisks,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    saveProject(project);
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message, project });
  }
});

apiRouter.post('/projects/:id/generate/personas', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildPersonasPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: personasOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.personas = {
      generatedAt: new Date().toISOString(),
      items: result.personas,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/generate/swot', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildSwotPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: swotOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.swot = {
      generatedAt: new Date().toISOString(),
      ...result,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/generate/business-model', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildBusinessModelPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: businessModelOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.businessModel = {
      generatedAt: new Date().toISOString(),
      ...result,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/generate/financial-feasibility', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildFinancialFeasibilityPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: financialFeasibilityOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.financialFeasibility = {
      generatedAt: new Date().toISOString(),
      ...result,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/generate/competitive', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  if (Array.isArray(req.body?.manualCompetitors)) {
    try {
      project.manualCompetitors = req.body.manualCompetitors.map((c: unknown) =>
        manualCompetitorSchema.parse(c)
      );
    } catch {
      res.status(400).json({ error: 'Invalid manual competitor fields.' });
      return;
    }
  }

  try {
    const template = buildCompetitivePrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: competitiveOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.competitivePositioning = {
      generatedAt: new Date().toISOString(),
      competitorsAnalyzedCount: project.manualCompetitors.length,
      verifiedExternalResearchConducted: false,
      dataSourceNotice: result.dataSourceNotice,
      positioningStatement: result.positioningStatement,
      differentiationOpportunities: enforceCompetitiveSourceIntegrity(
        result.differentiationOpportunities
      ),
      potentialAdvantages: enforceCompetitiveSourceIntegrity(result.potentialAdvantages),
      potentialWeaknesses: enforceCompetitiveSourceIntegrity(result.potentialWeaknesses),
      competitiveRisks: enforceCompetitiveSourceIntegrity(result.competitiveRisks),
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/generate/roadmap', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildRoadmapPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: roadmapOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.roadmap = {
      generatedAt: new Date().toISOString(),
      phases: result.phases,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/validate-consistency', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    const template = buildConsistencyValidationPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: consistencyValidationOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.consistencyValidation = {
      validatedAt: new Date().toISOString(),
      ...result,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

apiRouter.post('/projects/:id/generate/executive-summary', async (req: Request, res: Response) => {
  const project = getProject(String(req.params.id));
  if (!project) {
    res.status(404).json({ error: 'Strategy project not found.' });
    return;
  }

  try {
    // Run consistency validation automatically before synthesizing executive summary if not yet run
    if (!project.consistencyValidation) {
      const validationTemplate = buildConsistencyValidationPrompt(project);
      const validationResult = await generateStructuredModule({
        systemInstruction: validationTemplate.systemInstruction,
        prompt: validationTemplate.prompt,
        responseSchema: validationTemplate.responseSchema,
        zodValidator: consistencyValidationOutputSchema,
        thinkingLevel: ThinkingLevel.MEDIUM,
      });
      project.consistencyValidation = {
        validatedAt: new Date().toISOString(),
        ...validationResult,
      };
    }

    const template = buildExecutiveSummaryPrompt(project);
    const result = await generateStructuredModule({
      systemInstruction: template.systemInstruction,
      prompt: template.prompt,
      responseSchema: template.responseSchema,
      zodValidator: executiveSummaryOutputSchema,
      thinkingLevel: ThinkingLevel.MEDIUM,
    });

    project.executiveReport = {
      generatedAt: new Date().toISOString(),
      ...result,
    };

    const saved = saveProject(project);
    res.json({ project: saved });
  } catch (error) {
    const formatted = formatGeminiApiError(error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});
