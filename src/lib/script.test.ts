import { describe, expect, it } from 'vitest';
import { toCyrillic } from '@/lib/script';

describe('Uzbek Latin → Cyrillic', () => {
  it.each([
    ['Oʻzbekiston', 'Ўзбекистон'],
    ["Farg'ona", 'Фарғона'],
    ['Toshkent shahri', 'Тошкент шаҳри'],
    ['choy', 'чой'],
    ['yoʻl', 'йўл'],
    ['maʼlumot', 'маълумот'],
    ['ekspert bahosi', 'эксперт баҳоси'],
    ['yer', 'ер'],
    ['yangi loyiha', 'янги лойиҳа'],
    ['Yoqubov', 'Ёқубов'],
    ['SHARTLAR', 'ШАРТЛАР'],
    ['qishloq xoʻjaligi', 'қишлоқ хўжалиги'],
    ['Click, Payme va Fundy', 'Click, Payme ва Fundy'],
    ['213 000 000 soʻm', '213 000 000 сўм'],
    ['kontsert', 'концерт'],
  ])('%s → %s', (latin, cyrillic) => {
    expect(toCyrillic(latin)).toBe(cyrillic);
  });
});
