import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { wizardErrorText } from '@/features/wizard/errors';
import {
  deleteDocument,
  documentUrl,
  saveFounder,
  uploadDocument,
  type Draft,
  type FounderFields,
} from '@/features/wizard/api';
import { draftKey, useStepSave } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button, NumberField, SelectField, TextAreaField, TextField } from '@/components/ui';
import type { Database } from '@/lib/database.types';

type DocumentKind = Database['public']['Enums']['document_kind'];
const KINDS: DocumentKind[] = ['registration', 'business_plan', 'identity', 'financials', 'other'];

/** Step 6: who is behind the project, plus private documents for the review team. */
export function FounderStep({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const { run, busy, error, setError } = useStepSave(draft.project.id, 'founder');

  const f = draft.founder;
  const [form, setForm] = useState<FounderFields>({
    display_name: f?.display_name ?? profile?.full_name ?? '',
    role_title: f?.role_title ?? '',
    organization: f?.organization ?? '',
    location: f?.location ?? draft.project.location ?? '',
    bio: f?.bio ?? '',
    experience_years: f?.experience_years ?? null,
    registration_number: f?.registration_number ?? '',
  });
  const set = <K extends keyof FounderFields>(key: K, value: FounderFields[K]) =>
    setForm(x => ({ ...x, [key]: value }));
  const [kind, setKind] = useState<DocumentKind>('registration');
  const [uploading, setUploading] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: draftKey(draft.project.id) });

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setDocError(null);
    try {
      await uploadDocument(draft, file, kind);
      await refresh();
    } catch (err) {
      setDocError(wizardErrorText(t, err));
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.display_name.trim().length < 2) {
      setError(t('validation.name'));
      return;
    }
    const clean = (s: string | null) => s?.trim() || null;
    void run(() =>
      saveFounder(user!.id, !!f, {
        display_name: form.display_name.trim(),
        role_title: clean(form.role_title),
        organization: clean(form.organization),
        location: clean(form.location),
        bio: clean(form.bio),
        experience_years: form.experience_years,
        registration_number: clean(form.registration_number),
      }),
    );
  }

  return (
    <WizardShell
      draft={draft}
      step="founder"
      title={t('wizard.founder.title')}
      hint={t('wizard.founder.hint')}
      error={error}
      busy={busy}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('wizard.founder.name')}
          maxLength={120}
          value={form.display_name}
          onChange={e => set('display_name', e.target.value)}
        />
        <TextField
          label={t('wizard.founder.role')}
          maxLength={120}
          value={form.role_title ?? ''}
          onChange={e => set('role_title', e.target.value)}
          placeholder={t('wizard.founder.rolePlaceholder')}
        />
        <TextField
          label={t('wizard.founder.organization')}
          maxLength={160}
          value={form.organization ?? ''}
          onChange={e => set('organization', e.target.value)}
        />
        <TextField
          label={t('wizard.founder.registration')}
          hint={t('wizard.founder.registrationHint')}
          maxLength={120}
          value={form.registration_number ?? ''}
          onChange={e => set('registration_number', e.target.value)}
        />
        <TextField
          label={t('wizard.basics.location')}
          maxLength={120}
          value={form.location ?? ''}
          onChange={e => set('location', e.target.value)}
        />
        <NumberField
          label={t('wizard.founder.experience')}
          value={form.experience_years ?? 0}
          onValue={v => set('experience_years', v > 0 ? Math.min(80, Math.round(v)) : null)}
        />
      </div>
      <TextAreaField
        label={t('wizard.founder.bio')}
        hint={t('wizard.founder.bioHint')}
        rows={4}
        maxLength={4000}
        value={form.bio ?? ''}
        onChange={e => set('bio', e.target.value)}
      />

      <section className="space-y-3 pt-4 border-t border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">{t('wizard.founder.documents')}</h2>
        <p className="text-xs text-slate-500">{t('wizard.founder.documentsHint')}</p>
        {draft.documents.length > 0 && (
          <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {draft.documents.map(doc => (
              <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <button
                  type="button"
                  onClick={async () => window.open(await documentUrl(doc), '_blank', 'noopener')}
                  className="flex items-center gap-2 min-w-0 text-left text-slate-700 hover:text-emerald-700"
                >
                  <FileText className="w-4 h-4 shrink-0 text-slate-400" aria-hidden />
                  <span className="truncate">{doc.file_name}</span>
                  <span className="text-xs text-slate-400 shrink-0">· {t(`wizard.founder.kinds.${doc.kind}`)}</span>
                </button>
                <button
                  type="button"
                  aria-label={t('wizard.remove')}
                  onClick={async () => {
                    await deleteDocument(doc);
                    await refresh();
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-48">
            <SelectField
              label={t('wizard.founder.kind')}
              value={kind}
              onChange={e => setKind(e.target.value as DocumentKind)}
              options={KINDS.map(k => ({ value: k, label: t(`wizard.founder.kinds.${k}`) }))}
            />
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            hidden
            onChange={handleFile}
          />
          <Button variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
            <Upload className="w-4 h-4" aria-hidden />
            {t('wizard.founder.upload')}
          </Button>
        </div>
        {docError && <Alert variant="error">{docError}</Alert>}
      </section>
    </WizardShell>
  );
}
