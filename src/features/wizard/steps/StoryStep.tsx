import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ImagePlus, X } from 'lucide-react';
import { publicFileUrl } from '@/lib/supabase';
import { wizardErrorText } from '@/features/wizard/errors';
import { saveText, uploadCover, type Draft } from '@/features/wizard/api';
import { MIN_STORY } from '@/features/wizard/checks';
import { draftKey, useStepSave } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button, TextAreaField } from '@/components/ui';

/** Width and height of a picked image file, or null if the browser can't tell. */
async function imageSize(file: File): Promise<{ w: number; h: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { w: bitmap.width, h: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

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
  const [photoWarning, setPhotoWarning] = useState<string | null>(null);
  const coverUrl = publicFileUrl('project-images', draft.project.cover_image_path);

  async function handleCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setPhotoWarning(null);
    try {
      const size = await imageSize(file);
      await uploadCover(draft, file);
      // A gentle note, not a blocker: small or upright photos look poor in the 16:10 frame.
      if (size && size.h > size.w) setPhotoWarning(t('wizard.story.coverPortrait'));
      else if (size && size.w < 1200) setPhotoWarning(t('wizard.story.coverSmall', { w: size.w, h: size.h }));
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
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">{t('wizard.story.cover')}</p>
        {/* Same 16:10 shape as on the project page and the cards */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-page overflow-hidden aspect-[16/10] flex items-center justify-center">
          {coverUrl ? (
            <img src={coverUrl} alt={t('wizard.story.cover')} className="w-full h-full object-cover" />
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

        {/* What makes a good cover, in three lines */}
        <ul className="space-y-1 text-sm text-slate-600">
          <li className="flex gap-2">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-ink" aria-hidden />
            {t('wizard.story.coverTip1')}
          </li>
          <li className="flex gap-2">
            <X className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden />
            {t('wizard.story.coverTip2')}
          </li>
          <li className="flex gap-2">
            <Check className="w-4 h-4 mt-0.5 shrink-0 text-ink" aria-hidden />
            {t('wizard.story.coverTip3')}
          </li>
        </ul>

        {photoWarning && <Alert variant="warning">{photoWarning}</Alert>}
        {uploadError && <Alert variant="error">{uploadError}</Alert>}

        {/* How the project will look in lists */}
        {coverUrl && (
          <div className="pt-2 space-y-2">
            <p className="text-xs font-medium text-slate-500">{t('wizard.story.coverCardPreview')}</p>
            <div className="w-full max-w-64" aria-hidden>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                <img src={coverUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="mt-2 text-xs font-semibold text-ink">{t(`models.${draft.project.model}.name`)}</p>
              <p className="text-sm font-bold text-ink leading-snug line-clamp-2">{draft.text?.title}</p>
              <div className="mt-2 h-1.5 rounded-full bg-track" />
            </div>
          </div>
        )}
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
