import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ImagePlus } from 'lucide-react';
import { publicFileUrl } from '@/lib/supabase';
import { wizardErrorText } from '@/features/wizard/errors';
import { saveText, uploadCover, type Draft } from '@/features/wizard/api';
import { MIN_STORY } from '@/features/wizard/checks';
import { draftKey, useStepSave } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button, TextAreaField } from '@/components/ui';

/** Step 2: the story, risks and the cover photo. */
export function StoryStep({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const { run, busy, error } = useStepSave(draft.project.id, 'story');

  const [summary, setSummary] = useState(draft.text?.summary ?? '');
  const [story, setStory] = useState(draft.text?.story ?? '');
  const [risks, setRisks] = useState(draft.text?.risks ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const coverUrl = publicFileUrl('project-images', draft.project.cover_image_path);

  async function handleCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadCover(draft, file);
      await queryClient.invalidateQueries({ queryKey: draftKey(draft.project.id) });
    } catch (err) {
      setUploadError(wizardErrorText(t, err));
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void run(() => saveText(draft, { summary: summary.trim(), story: story.trim(), risks: risks.trim() }));
  }

  return (
    <WizardShell
      draft={draft}
      step="story"
      title={t('wizard.story.title')}
      hint={t('wizard.story.hint')}
      error={error}
      busy={busy}
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{t('wizard.story.cover')}</p>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 overflow-hidden aspect-[16/9] flex items-center justify-center">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-10 h-10 text-slate-300" aria-hidden />
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleCover} />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
            {coverUrl ? t('wizard.story.changeCover') : t('wizard.story.uploadCover')}
          </Button>
          <span className="text-xs text-slate-500">{t('wizard.story.coverHint', { mb: 5 })}</span>
        </div>
        {uploadError && <Alert variant="error">{uploadError}</Alert>}
      </div>

      <TextAreaField
        label={t('wizard.story.summary')}
        hint={t('wizard.story.summaryHint')}
        rows={3}
        maxLength={1000}
        value={summary}
        onChange={e => setSummary(e.target.value)}
      />
      <TextAreaField
        label={t('wizard.story.story')}
        hint={t('wizard.story.storyHint')}
        rows={12}
        maxLength={20000}
        minChars={MIN_STORY}
        value={story}
        onChange={e => setStory(e.target.value)}
      />
      <TextAreaField
        label={t('wizard.story.risks')}
        hint={t('wizard.story.risksHint')}
        rows={5}
        maxLength={5000}
        value={risks}
        onChange={e => setRisks(e.target.value)}
      />
    </WizardShell>
  );
}
