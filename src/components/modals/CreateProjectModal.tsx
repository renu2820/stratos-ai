import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { BusinessIntake } from '../../types/strategy';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (intake: BusinessIntake, runAnalysisImmediately: boolean) => Promise<void>;
}

const BUSINESS_STAGES = [
  'Idea / Concept',
  'Pre-Seed / Validation',
  'MVP / Early Traction',
  'Operating Small Business',
  'Scaling',
];

const EMPTY_INTAKE: BusinessIntake = {
  businessName: '',
  businessDescription: '',
  industry: '',
  targetGeography: '',
  intendedCustomers: '',
  estimatedStartingBudget: '',
  businessStage: 'Idea / Concept',
  mainObjective: '',
};

const SAMPLE_INTAKE: BusinessIntake = {
  businessName: 'Helios Heat-Pump Concierge',
  businessDescription:
    'A turn-key residential electrification service that audits homeowner HVAC readiness, secures utility and municipal rebates, and dispatches vetted local heat-pump installers under a transparent fixed-price guarantee.',
  industry: 'Residential CleanTech & Home Services',
  targetGeography: 'Colorado Front Range (Denver & Boulder)',
  intendedCustomers:
    'Owners of single-family homes built between 1970 and 2005 facing aging gas furnaces and rising utility costs.',
  estimatedStartingBudget: '$45,000',
  businessStage: 'Idea / Concept',
  mainObjective:
    'Complete 15 paid residential heat-pump installations via contractor partnerships within 5 months.',
};

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [form, setForm] = useState<BusinessIntake>(EMPTY_INTAKE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateField = (field: keyof BusinessIntake, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent, runAnalysisImmediately: boolean) => {
    e.preventDefault();
    setError(null);

    if (form.businessName.trim().length < 2) {
      setError('Please enter a business name (at least 2 characters).');
      return;
    }
    if (form.businessDescription.trim().length < 20) {
      setError('Please enter a business description of at least 20 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(form, runAnalysisImmediately);
      setForm(EMPTY_INTAKE);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create strategy project.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-[#E6E1D9] bg-white px-3 py-2 text-sm text-[#172B43] placeholder:text-[#98A2B3] focus:border-[#E85A32] focus:outline-none focus:ring-2 focus:ring-[#E85A32]/15';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#172B43]/35 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-strategy-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#E6E1D9] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E6E1D9] bg-[#F5F3EF] px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              New Venture Intake
            </p>
            <h2
              id="create-strategy-title"
              className="text-lg font-semibold text-[#172B43]"
            >
              Create Strategy Project
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm(SAMPLE_INTAKE)}
              className="rounded-lg border border-[#E6E1D9] bg-white px-3 py-1.5 text-xs font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Fill Sample Input
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1.5 text-[#667085] hover:bg-white hover:text-[#172B43] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => handleSubmit(e, true)}
          className="overflow-y-auto px-6 py-5 space-y-4"
        >
          <p className="text-xs text-[#667085]">
            Supply your venture facts. STRATOS AI separates confirmed inputs from AI-generated hypotheses.
          </p>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-sm text-[#991B1B]"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                Business Name <span className="text-[#E85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => updateField('businessName', e.target.value)}
                placeholder="e.g. Meridian Cold-Chain"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                Industry / Sector <span className="text-[#E85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.industry}
                onChange={(e) => updateField('industry', e.target.value)}
                placeholder="e.g. B2B Logistics SaaS"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
              Business Description <span className="text-[#E85A32]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.businessDescription}
              onChange={(e) => updateField('businessDescription', e.target.value)}
              placeholder="Describe the product or service, how it works, and the problem it solves..."
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                Target Geography <span className="text-[#E85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.targetGeography}
                onChange={(e) => updateField('targetGeography', e.target.value)}
                placeholder="e.g. Austin Metro, Texas"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                Estimated Starting Budget <span className="text-[#E85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.estimatedStartingBudget}
                onChange={(e) => updateField('estimatedStartingBudget', e.target.value)}
                placeholder="e.g. $25,000 or Bootstrapped"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                Business Stage <span className="text-[#E85A32]">*</span>
              </label>
              <select
                value={form.businessStage}
                onChange={(e) => updateField('businessStage', e.target.value)}
                className={inputClass}
              >
                {BUSINESS_STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
                Intended Customers <span className="text-[#E85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.intendedCustomers}
                onChange={(e) => updateField('intendedCustomers', e.target.value)}
                placeholder="e.g. Independent dental clinics"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#172B43]">
              Main Business Objective (6–12 Months) <span className="text-[#E85A32]">*</span>
            </label>
            <input
              type="text"
              required
              value={form.mainObjective}
              onChange={(e) => updateField('mainObjective', e.target.value)}
              placeholder="e.g. Reach 20 paying monthly clinic accounts within 6 months"
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E6E1D9] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-[#E6E1D9] bg-white px-4 py-2 text-sm font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={submitting}
              className="rounded-lg border border-[#E6E1D9] bg-white px-4 py-2 text-sm font-medium text-[#172B43] hover:bg-[#F5F3EF] whitespace-nowrap shrink-0 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#E85A32] px-5 py-2 text-sm font-medium text-white hover:bg-[#D44A23] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create & Analyze Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
