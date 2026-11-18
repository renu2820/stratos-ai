import { useState } from 'react';
import { Pencil, Check, Users } from 'lucide-react';
import type { CustomerPersona, PersonaTrait, StrategyProject } from '../../types/strategy';
import { EpistemicTag } from '../ui/EpistemicTag';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

interface PersonasViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => Promise<void>;
  onSavePersonas: (items: CustomerPersona[]) => Promise<void>;
}

export function PersonasView({
  project,
  isGenerating,
  error,
  onGenerate,
  onSavePersonas,
}: PersonasViewProps) {
  const personas = project.personas?.items ?? [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftPersona, setDraftPersona] = useState<CustomerPersona | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (persona: CustomerPersona) => {
    setEditingId(persona.id);
    setDraftPersona(JSON.parse(JSON.stringify(persona)) as CustomerPersona);
  };

  const handleSaveEdit = async () => {
    if (!draftPersona) return;
    setSaving(true);
    try {
      const updated = personas.map((p) => (p.id === draftPersona.id ? draftPersona : p));
      await onSavePersonas(updated);
      setEditingId(null);
      setDraftPersona(null);
    } finally {
      setSaving(false);
    }
  };

  const renderTraitList = (title: string, items: PersonaTrait[]) => (
    <div className="space-y-2">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start justify-between gap-2 text-sm text-[#172B43]"
          >
            <span>{item.text}</span>
            <EpistemicTag basis={item.basis} />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      <ModuleStatusHeader
        stepNumber="02. Customer Personas"
        title="Target Customer Personas"
        description="Structured buyer and user profiles grounded in your venture context. Inferred behavioral and demographic traits are explicitly tagged as AI Hypotheses."
        lastGeneratedAt={project.personas?.generatedAt}
        actionLabel={personas.length ? 'Regenerate Personas' : 'Generate Customer Personas'}
        onAction={onGenerate}
        isLoading={isGenerating}
        error={error}
      />

      {isGenerating && personas.length === 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-96 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]"
            />
          ))}
        </div>
      ) : personas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <Users className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            No customer personas generated yet
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#667085]">
            Generate structured customer segments detailing goals, pain points, purchasing
            motivations, expected behavior, and unmet needs.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="mt-5 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] cursor-pointer"
          >
            Generate Customer Personas
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {personas.map((persona) => {
            const isEditing = editingId === persona.id && draftPersona;
            return (
              <article
                key={persona.id}
                className="overflow-hidden rounded-xl border border-[#E6E1D9] bg-white"
              >
                <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D9] bg-[#F5F3EF] px-6 py-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={draftPersona.personaName}
                          onChange={(e) =>
                            setDraftPersona({ ...draftPersona, personaName: e.target.value })
                          }
                          className="w-full rounded border border-[#E6E1D9] bg-white px-2.5 py-1 text-base font-semibold text-[#172B43] focus:border-[#E85A32] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={draftPersona.roleOrArchetype}
                          onChange={(e) =>
                            setDraftPersona({
                              ...draftPersona,
                              roleOrArchetype: e.target.value,
                            })
                          }
                          className="w-full rounded border border-[#E6E1D9] bg-white px-2.5 py-1 text-xs text-[#667085] focus:border-[#E85A32] focus:outline-none"
                        />
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-[#172B43]">
                          {persona.personaName}
                        </h3>
                        <p className="text-xs font-medium text-[#E85A32]">
                          {persona.roleOrArchetype}
                        </p>
                      </>
                    )}
                  </div>

                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#E85A32] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#D44A23] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(persona)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E6E1D9] bg-white px-2.5 py-1.5 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-5">
                  {/* Demographics */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                        Demographics & Context
                      </h4>
                      <EpistemicTag basis={persona.demographics.basis} />
                    </div>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={draftPersona.demographics.summary}
                        onChange={(e) =>
                          setDraftPersona({
                            ...draftPersona,
                            demographics: {
                              summary: e.target.value,
                              basis: 'fact',
                            },
                          })
                        }
                        className="w-full rounded border border-[#E6E1D9] bg-white px-2.5 py-1.5 text-sm text-[#172B43] focus:border-[#E85A32] focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm text-[#172B43]">
                        {persona.demographics.summary}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 border-t border-[#E6E1D9] pt-4">
                    {renderTraitList('Goals', persona.goals)}
                    {renderTraitList('Pain Points', persona.painPoints)}
                    {renderTraitList('Purchasing Motivations', persona.purchasingMotivations)}
                    {renderTraitList('Expected Behavior', persona.expectedBehavior)}
                    {renderTraitList('Customer Needs', persona.customerNeeds)}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
