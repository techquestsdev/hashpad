const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const sample = fs.readFileSync(path.join(__dirname, 'sample.md'), 'utf8');

async function load(page, text) {
  await page.goto('/index.html');
  const article = page.locator('article');
  await article.click();
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (i > 0) await page.keyboard.press('Enter');
    if (lines[i]) await page.keyboard.insertText(lines[i]);
  }
  await page.keyboard.press('End');
  await page.keyboard.type(' ');
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
  return article;
}

test('round-trips text', async ({ page }) => {
  const article = await load(page, sample);
  expect((await article.textContent()).trim()).toBe(sample.trim());
});

test('headings', async ({ page }) => {
  const article = await load(page, sample);
  for (let n = 1; n <= 6; n++) {
    await expect(article.locator('.md-h' + n)).toHaveCount(n === 2 ? 9 : 1);
  }
});

test('inline styles', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-bold')).toBeGreaterThanOrEqual(4);
  expect(await count('.md-italic')).toBeGreaterThanOrEqual(2);
  expect(await count('.md-strike')).toBeGreaterThanOrEqual(1);
  expect(await count('.md-mark')).toBeGreaterThanOrEqual(1);
  expect(await count('.md-code')).toBeGreaterThanOrEqual(1);
  expect(await count('.md-escape')).toBe(2);
});

test('nested emphasis', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-bold .md-italic')).toBeGreaterThanOrEqual(1);
  expect(await count('.md-bold a.md-link')).toBe(1);
  expect(await count('.md-italic .md-code')).toBe(1);
  expect(await count('.md-strike .md-bold')).toBe(1);
  expect(await count('.md-mark .md-italic')).toBe(1);
  expect(await count('.md-bold .md-italic')).toBeGreaterThanOrEqual(2);
});

test('links', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('a.md-link[href="https://example.com"]')).toBeGreaterThanOrEqual(1);
  expect(await count('a.md-link[href="mailto:test@example.com"]')).toBe(1);
  expect(await count('a[href^="javascript"]')).toBe(0);
  expect(await article.locator('span.md-link', { hasText: 'Unsafe link' }).count()).toBe(1);
  expect(await count('a.md-url')).toBeGreaterThanOrEqual(2);
});

test('images, footnotes, references', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-image')).toBe(1);
  expect(await count('.md-footnote')).toBeGreaterThanOrEqual(1);
  expect(await article.locator('span.md-link', { hasText: 'Reference link' }).count()).toBe(1);
  expect(await count('.md-link-def')).toBeGreaterThanOrEqual(2);
});

test('lists', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-list-marker')).toBe(10);
  expect(await count('.md-task')).toBe(3);
  expect(await count('.md-task-done')).toBe(2);
});

test('nested blockquotes', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-blockquote')).toBe(4);
  const depths = await article.locator('.md-blockquote').evaluateAll(els => els.map(e => e.style.getPropertyValue('--depth')));
  expect(depths).toEqual(['1', '2', '3', '1']);
  expect(await count('.md-blockquote a.md-link')).toBe(1);
});

test('horizontal rules are visible and editable', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-hr')).toBe(4);
  const color = await article.locator('.md-hr').first().evaluate(el => getComputedStyle(el).color);
  expect(color).not.toBe('rgba(0, 0, 0, 0)');
  expect(color).not.toBe('transparent');
  expect(await article.locator('.md-hr').first().textContent()).toBe('---');
});

test('tables', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-table-row')).toBe(3);
  expect(await count('.md-table-separator')).toBe(1);
});

test('code blocks are inert', async ({ page }) => {
  const article = await load(page, sample);
  const count = sel => article.locator(sel).count();
  expect(await count('.md-codeblock')).toBe(2);
  expect(await count('.md-codeblock .md-bold')).toBe(0);
  expect(await count('.md-codeblock *')).toBe(0);
});

test('typing below a quote stays out of the quote', async ({ page }) => {
  const article = await load(page, '> quote');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('below');
  await page.waitForTimeout(200);
  expect((await article.textContent()).replace(/\n$/, '')).toBe('> quote\nbelow');
  expect(await article.locator('.md-blockquote').count()).toBe(1);
  expect(await article.locator('.md-blockquote').textContent()).not.toContain('below');
  const pos = await page.evaluate(() => {
    const s = getSelection();
    const r = s.getRangeAt(0);
    const pre = document.createRange();
    pre.selectNodeContents(document.querySelector('article'));
    pre.setEnd(r.endContainer, r.endOffset);
    return pre.toString().length;
  });
  expect(pos).toBe('> quote\nbelow'.length);
});

test('typing in the middle of nested bold keeps the caret', async ({ page }) => {
  const article = await load(page, '**bold _it_ end**');
  await page.keyboard.press('Home');
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowRight');
  }
  await page.keyboard.type('X');
  await page.waitForTimeout(200);
  await page.keyboard.type('Y');
  expect(await article.textContent()).toBe('**bXYold _it_ end**');
});

test('service worker registers', async ({ page }) => {
  await page.goto('/index.html');
  const ok = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return !!reg.active;
  });
  expect(ok).toBe(true);
});

test('manifest is valid JSON', async ({ page }) => {
  const res = await page.request.get('/manifest.json');
  const json = await res.json();
  expect(json.name).toBe('Hashpad');
});

test('loads and highlights without page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/index.html');
  await page.waitForTimeout(300);
  await load(page, sample);
  await page.evaluate(() => getSelection().removeAllRanges());
  await page.locator('article').dispatchEvent('keyup', { key: 'a' });
  await page.waitForTimeout(300);
  expect(errors).toEqual([]);
});

test('app shell loads offline', async ({ page, context }) => {
  await page.goto('/index.html');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('article')).toBeVisible();
  const article = page.locator('article');
  await article.click();
  await page.keyboard.insertText('# offline');
  await page.keyboard.type(' ');
  await expect(article.locator('.md-h1')).toHaveCount(1);
});
