import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { LANGUAGES, type Language } from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, ImagePlus, Languages, X } from 'lucide-react';
import { publicFileUrl } from '@/lib/supabase';
import { wizardErrorText } from '@/features/wizard/errors';
import { saveOtherText, saveText, uploadCover, type Draft, type OtherText } from '@/features/wizard/api';
import { MIN_STORY } from '@/features/wizard/checks';
import { draftKey, useStepSave } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button, TextAreaField, TextField } from '@/components/ui';

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

  // Optional texts in the other site languages: visitors see them when they switch language.
  const others = LANGUAGES.filter(l => l !== draft.project.original_language);
  const empty: OtherText = { title: '', tagline: '', summary: '', story: '', risks: '' };
  const [otherTexts, setOtherTexts] = useState<Record<string, OtherText>>(() =>
    Object.fromEntries(
      others.map(l => {
        const row = draft.otherTexts.find(r => r.language === l);
        return [
          l,
          row
            ? { title: row.title, tagline: row.tagline, summary: row.summary, story: row.story, risks: row.risks }
            : empty,
        ];
      }),
    ),
  );
  const [otherLang, setOtherLang] = useState<Language>(others[0]);
  const [otherError, setOtherError] = useState<string | null>(null);
  const setOther = (lang: Language, field: keyof OtherText, value: string) =>
    setOtherTexts(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  const hasText = (o: OtherText) => Object.values(o).some(v => v.trim());

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
    // A translation that has any text needs its own title (5–140 characters).
    const missingTitle = others.find(l => {
      const title = otherTexts[l].title.trim();
      return hasText(otherTexts[l]) && (title.length < 5 || title.length > 140);
    });
    if (missingTitle) {
      setOtherLang(missingTitle);
      setOtherError(t('wizard.story.otherTitleError', { language: t(`languages.${missingTitle}`) }));
      return;
    }
    setOtherError(null);
    void run(async () => {
      await saveText(draft, { summary: summary.trim(), story: story.trim(), risks: risks.trim() });
      for (const l of others) await saveOtherText(draft, l, otherTexts[l]);
    });
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

      {/* Other languages: optional, folded away so the step stays short */}
      <details
        className="group rounded-2xl border border-slate-200 bg-card"
        open={others.some(l => hasText(otherTexts[l])) || !!otherError}
      >
        <summary className="flex items-center justify-between gap-3 min-h-14 px-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 text-base font-semibold text-ink">
            <Languages className="w-5 h-5 text-brand dark:text-brand-light" aria-hidden />
            {t('wizard.story.otherTitle')}
            <span className="text-sm font-normal text-slate-500">{t('wizard.story.optional')}</span>
          </span>
          <ChevronDown className="w-5 h-5 text-slate-500 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <div className="px-4 pb-5 space-y-4">
          <p className="text-sm text-slate-600">{t('wizard.story.otherHint')}</p>
          <div role="tablist" aria-label={t('wizard.story.otherTitle')} className="flex gap-2">
            {others.map(l => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={otherLang === l}
                onClick={() => setOtherLang(l)}
                className={`min-h-11 px-4 rounded-full border text-sm font-semibold cursor-pointer ${
                  otherLang === l
                    ? 'border-brand bg-brand-soft text-ink ring-1 ring-brand'
                    : 'border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {t(`languages.${l}`)}
                {hasText(otherTexts[l]) && <Check className="inline w-4 h-4 ml-1 text-brand" aria-hidden />}
              </button>
            ))}
          </div>
          {otherError && <Alert variant="error">{otherError}</Alert>}
          <div role="tabpanel" className="space-y-4" lang={otherLang}>
            <TextField
              label={t('wizard.basics.name')}
              maxLength={140}
              value={otherTexts[otherLang].title}
              onChange={e => setOther(otherLang, 'title', e.target.value)}
            />
            <TextField
              label={t('wizard.basics.tagline')}
              maxLength={240}
              value={otherTexts[otherLang].tagline}
              onChange={e => setOther(otherLang, 'tagline', e.target.value)}
            />
            <TextAreaField
              label={t('wizard.story.summary')}
              rows={3}
              maxLength={1000}
              value={otherTexts[otherLang].summary}
              onChange={e => setOther(otherLang, 'summary', e.target.value)}
            />
            <TextAreaField
              label={t('wizard.story.story')}
              rows={8}
              maxLength={20000}
              value={otherTexts[otherLang].story}
              onChange={e => setOther(otherLang, 'story', e.target.value)}
            />
            <TextAreaField
              label={t('wizard.story.risks')}
              rows={4}
              maxLength={5000}
              value={otherTexts[otherLang].risks}
              onChange={e => setOther(otherLang, 'risks', e.target.value)}
            />
          </div>
        </div>
      </details>
    </WizardShell>
  );
}
