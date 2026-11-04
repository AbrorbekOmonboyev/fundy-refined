import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Region = Database['public']['Tables']['regions']['Row'];

let cache: Promise<Region[]> | null = null;

function fetchRegions(): Promise<Region[]> {
  if (!supabase) return Promise.resolve([]);
  cache ??= Promise.resolve(supabase.from('regions').select('*').order('sort_order')).then(({ data, error }) => {
    if (error) {
      cache = null; // try again next time
      throw error;
    }
    return data;
  });
  return cache;
}

/** Uzbekistan's regions as select options, named in the current language. */
export function useRegionOptions() {
  const { i18n } = useTranslation();
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    let active = true;
    fetchRegions()
      .then(data => active && setRegions(data))
      .catch(error => console.error('Could not load regions', error));
    return () => {
      active = false;
    };
  }, []);

  const lang = (i18n.resolvedLanguage ?? 'uz') as 'uz' | 'ru' | 'en';
  return regions.map(r => ({ value: r.id, label: r[`name_${lang}`] }));
}
