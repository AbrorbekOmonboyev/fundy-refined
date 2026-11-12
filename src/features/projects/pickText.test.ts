import { describe, expect, test } from 'vitest';
import { pickText } from '@/features/projects/api';

const uz = { language: 'uz' as const, title: 'Issiqxona', tagline: 'Bolalar uchun', story: 'Uzun hikoya' };
const ru = { language: 'ru' as const, title: 'Теплица', tagline: '', story: '' };

describe('pickText', () => {
  test('uses the visitor language when there is a text in it', () => {
    expect(pickText([uz, ru], 'ru', 'uz').text?.title).toBe('Теплица');
  });

  test('fills empty fields of a partial translation from the original', () => {
    const { text, isFallback } = pickText([uz, ru], 'ru', 'uz');
    expect(text?.tagline).toBe('Bolalar uchun');
    expect(text?.story).toBe('Uzun hikoya');
    expect(isFallback).toBe(false);
  });

  test('falls back to the original language when there is no translation', () => {
    const { text, isFallback } = pickText([uz], 'en', 'uz');
    expect(text?.title).toBe('Issiqxona');
    expect(isFallback).toBe(true);
  });
});
