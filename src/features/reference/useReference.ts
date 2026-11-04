import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

type Named = { id: string; name_uz: string; name_ru: string; name_en: string };

async function fetchRegions(): Promise<Named[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('regions').select('id, name_uz, name_ru, name_en').order('sort_order');
  if (error) throw error;
  return data;
}

async function fetchCategories(): Promise<Named[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('id, name_uz, name_ru, name_en')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data;
}

function useNamed(table: 'regions' | 'categories') {
  const { i18n } = useTranslation();
  const { data = [] } = useQuery({
    queryKey: ['reference', table],
    queryFn: table === 'regions' ? fetchRegions : fetchCategories,
    staleTime: Infinity, // these lists rarely change
  });
  const lang = (i18n.resolvedLanguage ?? 'uz') as 'uz' | 'ru' | 'en';
  const options = data.map(r => ({ value: r.id, label: r[`name_${lang}`] }));
  const nameOf = (id: string | null | undefined) => (id ? (options.find(o => o.value === id)?.label ?? id) : '');
  return { options, nameOf };
}

/** Uzbekistan's regions, named in the current language. */
export const useRegions = () => useNamed('regions');
/** Project categories, named in the current language. */
export const useCategories = () => useNamed('categories');
