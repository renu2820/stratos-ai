import { useState, type FormEvent } from 'react';
import { LayoutGrid, Plus, Trash2 } from 'lucide-react';
import type { BusinessModelCanvas, StrategyProject } from '../../types/strategy';
import { EpistemicTag } from '../ui/EpistemicTag';
import { ModuleStatusHeader } from '../ui/ModuleStatusHeader';

interface BusinessModelViewProps {
  project: StrategyProject;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => Promise<void>;
  onSaveBusinessModel: (canvas: BusinessModelCanvas) => Promise<void>;
}

type BlockKey = Exclude<keyof BusinessModelCanvas, 'generatedAt'>;

const CANVAS_BLOCKS: { key: BlockKey; title: string; subtitle: string }[] = [
  {
    key: 'valueProposition',
    title: 'Value Proposition',
    subtitle: 'Core promise delivered to target buyers',
  },
  {
    key: 'customerSegments',
    title: 'Customer Segments',
    subtitle: 'Priority buyer cohorts and adopters',
  },
  {
    key: 'revenueStreams',
    title: 'Revenue Streams',
    subtitle: 'Pricing tiers and monetization mechanics',
  },
  {
    key: 'distributionChannels',
    title: 'Distribution Channels',
    subtitle: 'Acquisition, delivery, and sales routes',
  },
  {
    key: 'customerRelationships',
    title: 'Customer Relationships',
    subtitle: 'Onboarding, retention, and support model',
  },
  {
    key: 'keyActivities',
    title: 'Key Activities',
    subtitle: 'Critical operational workflows',
  },
  {
    key: 'keyResources',
    title: 'Key Resources',
    subtitle: 'Assets, talent, and systems needed',
  },
  {
    key: 'costStructure',
    title: 'Cost Structure',
    subtitle: 'Fixed and variable cost drivers',
  },
];

export function BusinessModelView({
  project,
  isGenerating,
  error,
  onGenerate,
  onSaveBusinessModel,
}: BusinessModelViewProps) {
  const canvas = project.businessModel;
  const [addingBlock, setAddingBlock] = useState<BlockKey | null>(null);
  const [newText, setNewText] = useState('');

  const handleAdd = async (e: FormEvent, key: BlockKey) => {
    e.preventDefault();
    if (!canvas || !newText.trim()) return;
    await onSaveBusinessModel({
      ...canvas,
      [key]: [
        ...canvas[key],
        {
          id: `bm-custom-${Date.now()}`,
          text: newText.trim(),
          basis: 'fact',
        },
      ],
    });
    setNewText('');
    setAddingBlock(null);
  };

  const handleRemove = async (key: BlockKey, id: string) => {
    if (!canvas) return;
    await onSaveBusinessModel({
      ...canvas,
      [key]: canvas[key].filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <ModuleStatusHeader
        stepNumber="04. Business Model"
        title="Business Model Designer"
        description="Structured 8-block operating model aligning value proposition, customer segments, unit revenue, channels, key operations, and cost drivers."
        lastGeneratedAt={canvas?.generatedAt}
        actionLabel={canvas ? 'Regenerate Business Model' : 'Design Business Model'}
        onAction={onGenerate}
        isLoading={isGenerating}
        error={error}
      />

      {isGenerating && !canvas ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-44 animate-pulse rounded-xl border border-[#E6E1D9] bg-[#F5F3EF]"
            />
          ))}
        </div>
      ) : !canvas ? (
        <div className="rounded-xl border border-dashed border-[#E6E1D9] bg-[#F5F3EF]/70 p-10 text-center">
          <LayoutGrid className="mx-auto h-7 w-7 text-[#E85A32]" />
          <h3 className="mt-3 text-base font-semibold text-[#172B43]">
            Business Model Canvas is empty
          </h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-[#667085]">
            Generate an 8-block business model tailored to your budget, personas, and
            operating constraints.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="mt-5 rounded-lg bg-[#E85A32] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#D44A23] cursor-pointer"
          >
            Design Business Model
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {CANVAS_BLOCKS.map((block, index) => (
            <section
              key={block.key}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E6E1D9] bg-white"
            >
              <div className="flex items-start justify-between gap-2 border-b border-[#E6E1D9] bg-[#F5F3EF] px-5 py-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#E85A32] tabular-nums">
                      0{index + 1}
                    </span>
                    <h2 className="text-sm font-semibold text-[#172B43]">
                      {block.title}
                    </h2>
                  </div>
                  <p className="text-xs text-[#667085]">{block.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAddingBlock(addingBlock === block.key ? null : block.key)
                  }
                  className="inline-flex items-center gap-1 rounded-md border border-[#E6E1D9] bg-white px-2.5 py-1 text-xs font-medium text-[#172B43] hover:bg-[#EBE7E0] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="h-3 w-3 text-[#E85A32]" />
                  Add
                </button>
              </div>

              <div className="p-5">
                {addingBlock === block.key && (
                  <form
                    onSubmit={(e) => handleAdd(e, block.key)}
                    className="mb-3.5 flex gap-2"
                  >
                    <input
                      type="text"
                      required
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder={`Add to ${block.title}...`}
                      className="flex-1 rounded-lg border border-[#E6E1D9] bg-white px-3 py-1.5 text-xs text-[#172B43] focus:border-[#E85A32] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#E85A32] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#D44A23] cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                )}

                <ul className="space-y-3">
                  {canvas[block.key].map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start justify-between gap-3 text-sm text-[#172B43]"
                    >
                      <div className="space-y-1">
                        <p className="leading-relaxed">{item.text}</p>
                        <EpistemicTag basis={item.basis} />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(block.key, item.id)}
                        aria-label="Remove item"
                        className="p-1 text-[#667085] hover:text-[#B91C1C] shrink-0 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
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
