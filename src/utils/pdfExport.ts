import { jsPDF } from 'jspdf';
import type { StrategyProject } from '../types/strategy';
import { formatShortDate, getProjectCompletion } from './projectProgress';

export function exportStrategyPdf(project: StrategyProject): void {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  let y = 56;

  const ensureSpace = (needed = 40) => {
    if (y + needed > pageHeight - 54) {
      doc.addPage();
      y = 54;
    }
  };

  const writeHeading = (text: string, size = 14) => {
    ensureSpace(36);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(size);
    doc.setTextColor(15, 23, 42);
    doc.text(text, margin, y);
    y += 6;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  };

  const writeSubheading = (text: string) => {
    ensureSpace(24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(232, 90, 50);
    doc.text(text, margin, y);
    y += 15;
  };

  const writeParagraph = (text: string, indent = 0, fontSize = 10) => {
    if (!text.trim()) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(23, 43, 67);
    const lines = doc.splitTextToSize(text, maxWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin + indent, y);
      y += 14;
    }
    y += 4;
  };

  const writeBullet = (text: string, tag?: string) => {
    const label = tag ? `[${tag.toUpperCase()}] ` : '';
    writeParagraph(`• ${label}${text}`, 10, 9.5);
  };

  // Cover / Header Banner
  doc.setFillColor(23, 43, 67);
  doc.rect(0, 0, pageWidth, 108, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(232, 90, 50);
  doc.text('STRATOS AI — EXECUTIVE STRATEGY REPORT', margin, 36);

  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(project.intake.businessName, maxWidth) as string[];
  doc.text(titleLines[0] ?? project.intake.businessName, margin, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(203, 213, 225);
  const completion = getProjectCompletion(project);
  doc.text(
    `${project.intake.industry}  |  ${project.intake.businessStage}  |  Completion: ${completion.percentage}%  |  Updated ${formatShortDate(project.updatedAt)}`,
    margin,
    86
  );

  y = 132;

  if (project.isDemo) {
    writeParagraph(
      'NOTE: This report was generated from a clearly labeled STRATOS AI demonstration workspace.',
      0,
      9
    );
  }

  // 1. Executive Summary
  writeHeading('1. Executive Summary');
  if (project.executiveReport) {
    writeSubheading('Strategic Thesis');
    writeParagraph(project.executiveReport.strategicThesis);
    writeSubheading('Executive Overview');
    for (const para of project.executiveReport.executiveSummary.split('\n\n')) {
      writeParagraph(para);
    }
  } else {
    writeParagraph('Executive synthesis has not yet been generated for this project.');
  }

  // 2. Business Overview
  writeHeading('2. Business Overview & Intake Facts');
  writeParagraph(`Description: ${project.intake.businessDescription}`);
  writeParagraph(`Target Geography: ${project.intake.targetGeography}`);
  writeParagraph(`Intended Customers: ${project.intake.intendedCustomers}`);
  writeParagraph(`Estimated Starting Budget: ${project.intake.estimatedStartingBudget}`);
  writeParagraph(`Main Objective: ${project.intake.mainObjective}`);

  if (project.ideaAnalysis) {
    writeSubheading('Core Value Proposition');
    writeParagraph(project.ideaAnalysis.coreValueProposition);
    const answered = project.ideaAnalysis.clarificationQuestions.filter((q) => q.answer.trim());
    if (answered.length > 0) {
      writeSubheading('Founder Clarifications (Preserved Verbatim)');
      for (const q of answered) {
        writeBullet(`${q.question} — Answer: ${q.answer}`, 'Fact');
      }
    }
    if (project.additionalClarificationNotes?.length) {
      writeSubheading('Additional Verbatim Notes & Constraints');
      for (const note of project.additionalClarificationNotes) {
        writeBullet(note, 'Fact');
      }
    }
  }

  // 3. Customer Personas
  if (project.personas?.items?.length) {
    writeHeading('3. Customer Personas');
    for (const persona of project.personas.items) {
      writeSubheading(`${persona.personaName} — ${persona.roleOrArchetype}`);
      writeBullet(`Demographics: ${persona.demographics.summary}`, persona.demographics.basis);
      for (const g of persona.goals) writeBullet(`Goal: ${g.text}`, g.basis);
      for (const p of persona.painPoints) writeBullet(`Pain Point: ${p.text}`, p.basis);
      for (const m of persona.purchasingMotivations) writeBullet(`Motivation: ${m.text}`, m.basis);
    }
  }

  // 4. SWOT Analysis
  if (project.swot) {
    writeHeading('4. SWOT Analysis');
    const sections: [string, typeof project.swot.strengths][] = [
      ['Strengths', project.swot.strengths],
      ['Weaknesses', project.swot.weaknesses],
      ['Opportunities', project.swot.opportunities],
      ['Threats', project.swot.threats],
    ];
    for (const [label, items] of sections) {
      writeSubheading(label);
      for (const item of items) {
        writeBullet(`${item.point} (${item.rationale})`, `${item.basis} / ${item.impact} impact`);
      }
    }
  }

  // 5. Business Model
  if (project.businessModel) {
    writeHeading('5. Business Model Canvas');
    const bm = project.businessModel;
    const blocks: [string, typeof bm.valueProposition][] = [
      ['Value Proposition', bm.valueProposition],
      ['Customer Segments', bm.customerSegments],
      ['Revenue Streams', bm.revenueStreams],
      ['Key Resources', bm.keyResources],
      ['Key Activities', bm.keyActivities],
      ['Cost Structure', bm.costStructure],
      ['Distribution Channels', bm.distributionChannels],
      ['Customer Relationships', bm.customerRelationships],
    ];
    for (const [title, items] of blocks) {
      writeSubheading(title);
      for (const item of items) {
        writeBullet(item.text, item.basis);
      }
    }
  }

  // 6. Financial Feasibility
  if (project.financialFeasibility) {
    const fin = project.financialFeasibility;
    writeHeading('6. Financial Feasibility & Unit Economics');
    writeBullet(
      `Data Sufficiency (${fin.sufficiencyAssessment.status.toUpperCase()}): ${fin.sufficiencyAssessment.summary}`
    );
    writeSubheading('Revenue Model & Unit Economics');
    writeBullet(fin.revenueModel.description, fin.revenueModel.basis);
    for (const rate of fin.revenueModel.preservedProposedRates) {
      writeBullet(`Preserved Proposed Rate (Unvalidated): ${rate}`, 'Fact');
    }
    writeBullet(
      `Revenue Per Transaction: ${fin.revenuePerTransaction.valueOrFormula} — ${fin.revenuePerTransaction.rationale}`,
      fin.revenuePerTransaction.basis
    );
    writeBullet(
      `Contribution Margin: ${fin.contributionMargin.valueOrFormula} — ${fin.contributionMargin.rationale}`,
      fin.contributionMargin.basis
    );
    writeBullet(
      `Break-Even: ${fin.breakEvenAnalysis.breakEvenThreshold} — ${fin.breakEvenAnalysis.summary}`,
      fin.breakEvenAnalysis.basis
    );
    writeSubheading('Capital Allocation, Fixed & Variable Costs');
    for (const row of fin.initialCapitalAllocation) {
      writeBullet(`Capital: ${row.item} — ${row.amount} (${row.cadenceOrUnit})`, row.basis);
    }
    for (const row of fin.fixedCosts) {
      writeBullet(`Fixed Cost: ${row.item} — ${row.amount} (${row.cadenceOrUnit})`, row.basis);
    }
    for (const row of fin.variableCosts) {
      writeBullet(`Variable Cost: ${row.item} — ${row.amount} (${row.cadenceOrUnit})`, row.basis);
    }
    writeBullet(
      `Working Capital: ${fin.workingCapitalRequirements.estimatedBuffer} — ${fin.workingCapitalRequirements.summary}`,
      fin.workingCapitalRequirements.basis
    );
    writeSubheading('Scenario Analysis');
    for (const sc of fin.scenarioAnalysis) {
      writeBullet(
        `${sc.scenarioName}: ${sc.projectedOutcome} (${sc.feasibilityNote})`,
        sc.basis
      );
    }
  }

  // 7. Competitive Positioning
  if (project.competitivePositioning) {
    const cp = project.competitivePositioning;
    writeHeading('7. Competitive Positioning');
    writeParagraph(
      `External Research Conducted: ${cp.verifiedExternalResearchConducted ? 'Yes' : 'No'} | ${cp.dataSourceNotice}`,
      0,
      9
    );
    writeSubheading('Positioning Statement');
    writeParagraph(cp.positioningStatement);
    writeSubheading('Differentiation Opportunities');
    for (const d of cp.differentiationOpportunities) {
      writeBullet(d.statement, `${d.sourceType ?? 'ai_hypothesis'} / ${d.basis}`);
    }
    writeSubheading('Potential Advantages');
    for (const a of cp.potentialAdvantages) {
      writeBullet(a.statement, `${a.sourceType ?? 'ai_hypothesis'} / ${a.basis}`);
    }
    writeSubheading('Competitive Risks');
    for (const r of cp.competitiveRisks) {
      writeBullet(r.statement, `${r.sourceType ?? 'ai_hypothesis'} / ${r.basis}`);
    }
  }

  // 8. Strategic Roadmap
  if (project.roadmap?.phases?.length) {
    writeHeading('8. Conditional Strategic Roadmap');
    for (const phase of project.roadmap.phases) {
      writeSubheading(`${phase.phaseTitle} (${phase.timeframe})`);
      for (const gate of phase.entryConditions ?? []) {
        writeBullet(`Entry Gate: ${gate}`);
      }
      for (const trig of phase.conditionalTriggers ?? []) {
        writeBullet(
          `Trigger: IF ${trig.condition} -> ${trig.targetMilestone} (${trig.metricThreshold})`
        );
      }
      for (const obj of phase.objectives) writeBullet(`Objective: ${obj}`);
      for (const del of phase.deliverables) writeBullet(`Deliverable: ${del}`);
      for (const kpi of phase.successIndicators) writeBullet(`Success Indicator: ${kpi}`);
    }
  }

  // 9. Strategy Consistency Audit
  if (project.consistencyValidation) {
    const cv = project.consistencyValidation;
    writeHeading('9. Strategy Consistency Validation');
    writeParagraph(`Status: ${cv.overallStatus.toUpperCase()} — ${cv.summary}`);
    for (const chk of cv.checks) {
      writeBullet(
        `${chk.title}: ${chk.description} (Resolution: ${chk.resolutionGuidance})`,
        `${chk.severity} / ${chk.category}`
      );
    }
  }

  // 10. Risks, Next Steps & Report Transparency Ledger
  writeHeading('10. Risks, Next Steps & Report Transparency Ledger');
  const risks =
    project.executiveReport?.criticalRisksAndAssumptions ??
    project.ideaAnalysis?.keyBusinessRisks ??
    [];
  if (risks.length > 0) {
    writeSubheading('Critical Risks & Assumptions');
    for (const r of risks) {
      writeBullet(`${r.statement}${r.rationale ? ` — ${r.rationale}` : ''}`, r.basis);
    }
  }

  if (project.executiveReport?.recommendedNextSteps?.length) {
    writeSubheading('Recommended Next Steps');
    for (const step of project.executiveReport.recommendedNextSteps) {
      writeBullet(`${step.action} (${step.ownerFocus})`, step.priority);
    }
  }

  if (project.executiveReport?.transparencyLedger) {
    const ledger = project.executiveReport.transparencyLedger;
    const ledgerSections: [string, string[]][] = [
      ['Confirmed Inputs', ledger.confirmedInputs],
      ['Unvalidated Assumptions', ledger.unvalidatedAssumptions],
      ['Recommendations', ledger.recommendations],
      ['Missing Information', ledger.missingInformation],
      ['Decisions Requiring Human Validation', ledger.decisionsRequiringHumanValidation],
    ];
    for (const [label, entries] of ledgerSections) {
      if (entries.length > 0) {
        writeSubheading(`Transparency Ledger — ${label}`);
        for (const item of entries) writeBullet(item);
      }
    }
  }

  const slug = project.intake.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'strategy';
  doc.save(`STRATOS-AI-${slug}-Strategy-Report.pdf`);
}
