import type { EvidenceBasis } from '../../types/strategy';

interface EpistemicTagProps {
  basis: EvidenceBasis;
}

const BASIS_CONFIG: Record<
  EvidenceBasis,
  { label: string; className: string }
> = {
  fact: {
    label: 'Supplied Fact',
    className:
      'border-[#B7E4C7] bg-[#F0FDF4] text-[#166534]',
  },
  hypothesis: {
    label: 'AI Hypothesis',
    className:
      'border-[#F6C8B8] bg-[#FFF5F2] text-[#C8441E]',
  },
  recommendation: {
    label: 'Recommendation',
    className:
      'border-[#D5DCE4] bg-[#F5F3EF] text-[#172B43]',
  },
};

export function EpistemicTag({ basis }: EpistemicTagProps) {
  const cfg = BASIS_CONFIG[basis] ?? BASIS_CONFIG.hypothesis;
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none tracking-tight whitespace-nowrap shrink-0 ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
