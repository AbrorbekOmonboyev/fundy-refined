/**
 * Uzbek in Cyrillic (Ўзбекча). The site's Uzbek texts are written in Latin; when a
 * visitor picks "ЎЗ", we stay in Uzbek (same data, same profile language) and convert
 * what's on screen letter by letter. Only Uzbek text is converted: anything inside an
 * element with another lang (an English project, say) or marked data-no-translit stays.
 */
import i18n from '@/i18n';

export type Script = 'latn' | 'cyrl';
const KEY = 'fundy-script';

const SINGLE: Record<string, string> = {
  a: 'а',
  b: 'б',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'ҳ',
  i: 'и',
  j: 'ж',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  q: 'қ',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'в',
  x: 'х',
  y: 'й',
  z: 'з',
  c: 'с',
  w: 'в',
};
const APOSTROPHES = "ʻ'’‘`";
const TUTUQ = 'ʼ';
/** Names that are the same in every script. */
const KEEP =
  /^(Fundy|Click|Payme|Uzcard|Humo|Telegram|Google|Visa|Mastercard|AgroSmart|Andijan|Mobility|Green|Tech|PDF|IT|AI|UZS|TAS-IX|PLA|ESP32|Arduino|LiFePO4|R290|PIR|IoT|EC\/pH|CC|BY|SA|CC0)$/;

const isLetter = (c: string | undefined) => !!c && /[A-Za-zʻ]/.test(c);
const upper = (s: string, likeUpper: boolean, wholeWordUpper: boolean) =>
  likeUpper ? (wholeWordUpper ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1)) : s;

/** One word, Latin → Cyrillic. */
function word(w: string): string {
  if (KEEP.test(w) || /\d/.test(w) || /@|\.(uz|com)$/.test(w)) return w;
  const allUpper = w.length > 1 && w === w.toUpperCase();
  let out = '';
  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    const lc = c.toLowerCase();
    const isUp = c !== lc;
    const next = w[i + 1]?.toLowerCase();
    const after = w[i + 2];
    const prev = w[i - 1];
    const emit = (cyr: string, skip = 0) => {
      out += upper(cyr, isUp, allUpper);
      i += skip;
    };
    if ((lc === 'o' || lc === 'g') && next && APOSTROPHES.includes(next)) emit(lc === 'o' ? 'ў' : 'ғ', 1);
    else if (lc === 's' && next === 'h') emit('ш', 1);
    else if (lc === 'c' && next === 'h') emit('ч', 1);
    else if (lc === 't' && next === 's' && isLetter(after) && i > 0)
      emit('ц', 1); // kontsert → концерт
    else if (lc === 'y' && next === 'o' && !(after && APOSTROPHES.includes(after))) emit('ё', 1);
    else if (lc === 'y' && next === 'u') emit('ю', 1);
    else if (lc === 'y' && next === 'a') emit('я', 1);
    else if (lc === 'y' && next === 'e') emit('е', 1);
    else if (lc === 'e' && (i === 0 || /[aeiouAEIOU]/.test(prev ?? ''))) emit('э');
    else if (c === TUTUQ || (APOSTROPHES.includes(c) && isLetter(prev) && isLetter(w[i + 1]))) out += 'ъ';
    else if (SINGLE[lc]) emit(SINGLE[lc]);
    else out += c;
  }
  return out;
}

/** Uzbek Latin text → Uzbek Cyrillic. */
export function toCyrillic(text: string): string {
  return text.replace(/[A-Za-zʻʼ'’‘`]+(?:[-][A-Za-zʻʼ'’‘`]+)*/g, chunk => {
    // a lone apostrophe or quote isn't a word
    if (!/[A-Za-z]/.test(chunk)) return chunk;
    return chunk
      .split('-')
      .map(part => (/^[A-Za-z]/.test(part) || part.startsWith('ʻ') ? word(part) : part))
      .join('-');
  });
}

// -----------------------------------------------------------------------------
// The visitor's choice
// -----------------------------------------------------------------------------
export function getScript(): Script {
  try {
    return localStorage.getItem(KEY) === 'cyrl' ? 'cyrl' : 'latn';
  } catch {
    return 'latn';
  }
}

const isActive = () => getScript() === 'cyrl' && (i18n.resolvedLanguage ?? 'uz') === 'uz';
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'] as const;
const original = new WeakMap<Node, string>(); // Latin text we replaced, to restore on switch back
const done = new WeakMap<Node, string>(); // what we wrote, so we don't convert twice

/** Text typed by people (inputs) is never changed; their placeholder and label are. */
function skip(el: Element | null, forAttributes = false): boolean {
  const fields = forAttributes ? '' : ', textarea, input';
  const owner = el?.closest(`[lang], [data-no-translit], script, style, code${fields}`);
  if (!owner) return false;
  if (owner.matches(`[data-no-translit], script, style, code${fields}`)) return true;
  const lang = owner.getAttribute('lang') ?? '';
  return !(lang === 'uz' || lang.startsWith('uz-'));
}

function convertNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.nodeValue ?? '';
    if (!text.trim() || done.get(node) === text || skip(node.parentElement)) return;
    original.set(node, text);
    const cyr = toCyrillic(text);
    done.set(node, cyr);
    if (cyr !== text) node.nodeValue = cyr;
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (skip(el, true)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v && !v.startsWith('/') && !v.startsWith('http')) {
      const key = `data-latn-${a}`;
      if (el.getAttribute(`data-cyrl-${a}`) === v) continue;
      el.setAttribute(key, v);
      const cyr = toCyrillic(v);
      el.setAttribute(`data-cyrl-${a}`, cyr);
      el.setAttribute(a, cyr);
    }
  }
  if (!skip(el)) node.childNodes.forEach(convertNode);
}

function restore(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const latin = original.get(node);
    if (latin !== undefined && node.nodeValue === done.get(node)) node.nodeValue = latin;
    done.delete(node);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  for (const a of ATTRS) {
    const latin = el.getAttribute(`data-latn-${a}`);
    if (latin !== null && el.getAttribute(a) === el.getAttribute(`data-cyrl-${a}`)) el.setAttribute(a, latin);
    el.removeAttribute(`data-latn-${a}`);
    el.removeAttribute(`data-cyrl-${a}`);
  }
  node.childNodes.forEach(restore);
}

let observer: MutationObserver | null = null;
const listeners = new Set<() => void>();

function apply() {
  const root = document.body;
  document.documentElement.setAttribute('lang', isActive() ? 'uz-Cyrl' : (i18n.resolvedLanguage ?? 'uz'));
  if (isActive()) {
    convertNode(root);
    document.head.querySelectorAll('title').forEach(convertNode);
    if (!observer) {
      observer = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'characterData') convertNode(r.target);
          else if (r.type === 'attributes' && r.target instanceof Element) convertNode(r.target);
          else r.addedNodes.forEach(convertNode);
        }
      });
      observer.observe(root, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...ATTRS],
      });
      // the browser tab title
      observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    }
  } else {
    observer?.disconnect();
    observer = null;
    restore(root);
    document.head.querySelectorAll('title').forEach(restore);
  }
  listeners.forEach(l => l());
}

export function setScript(script: Script) {
  try {
    localStorage.setItem(KEY, script);
  } catch {
    /* private mode: just don't remember */
  }
  apply();
}

/** Call once at start-up: applies the saved choice and follows language changes. */
export function startScript() {
  i18n.on('languageChanged', () => queueMicrotask(apply));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else queueMicrotask(apply);
}

export function onScriptChange(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
