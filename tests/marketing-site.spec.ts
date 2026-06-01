import { test, expect, Page } from '@playwright/test';

/**
 * Marketing-site checks for the feat/marketing-site-update changes.
 *
 * Target URL comes from PREVIEW_URL (see playwright.config.ts); defaults to
 * production. Runs under both a desktop and a mobile (iPhone 13) project, so
 * the content + mobile-load checks are exercised on both viewports.
 *
 * Note on CTAs: this site is a single-page app. Its call-to-action buttons
 * navigate via inline `onclick="window.location.href='...'"` rather than an
 * <a href>, and most <a> tags use JS handlers (showPage/openModal) with no
 * href. The link checks below therefore validate (a) every <a> that *has* an
 * href, and (b) the navigation target of every CTA button that navigates.
 */

// Scroll the whole page so any lazily-loaded imagery is requested before we
// assert on it.
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let y = 0;
      const step = () => {
        window.scrollBy(0, window.innerHeight);
        y += window.innerHeight;
        if (y < document.body.scrollHeight) {
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, 0);
          resolve();
        }
      };
      step();
    });
  });
}

test.beforeEach(async ({ page }) => {
  const resp = await page.goto('/', { waitUntil: 'domcontentloaded' });
  // Page itself must load successfully.
  expect(resp, 'no response from the page').toBeTruthy();
  expect(resp!.status(), `unexpected HTTP status ${resp!.status()}`).toBeLessThan(400);
});

test('launch date says 9th June 2026', async ({ page }) => {
  // Visible on the home page (hero badge + CTA) and in the <title>.
  await expect(page.getByText(/9th June 2026/i).first()).toBeVisible();
  await expect(page).toHaveTitle(/9th June 2026/i);
});

test('"no monthly cost" messaging is visible', async ({ page }) => {
  await expect(page.getByText(/no monthly cost/i).first()).toBeVisible();
});

test('"no signup fee" messaging is visible', async ({ page }) => {
  await expect(page.getByText(/no signup fee/i).first()).toBeVisible();
});

test('3.5% platform fee is mentioned and visible', async ({ page }) => {
  await expect(page.getByText(/3\.5%/).first()).toBeVisible();
});

test('no broken images', async ({ page }) => {
  await scrollThrough(page);
  await page.waitForLoadState('networkidle');

  const broken = await page.evaluate(() =>
    Array.from(document.images)
      // Only consider images the browser actually attempted to load.
      .filter((img) => !!(img.currentSrc || img.getAttribute('src')))
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  );

  expect(broken, `Broken images:\n${broken.join('\n')}`).toEqual([]);
});

test('all <a> links with an href have a valid target', async ({ page }) => {
  const badLinks = await page.$$eval('a[href]', (anchors) =>
    anchors
      .map((a) => ({
        href: (a.getAttribute('href') || '').trim(),
        text: (a.textContent || '').trim().slice(0, 40),
      }))
      .filter(
        (l) =>
          l.href === '' ||
          l.href === '#' ||
          l.href.toLowerCase().startsWith('javascript:'),
      ),
  );

  expect(
    badLinks,
    `Anchors with empty / placeholder href:\n${JSON.stringify(badLinks, null, 2)}`,
  ).toEqual([]);
});

test('all CTA buttons navigate to a valid URL', async ({ page }) => {
  // CTAs navigate via inline onclick="window.location.href='...'".
  const ctas = await page.$$eval('button[onclick], a[onclick]', (els) =>
    els
      .map((el) => {
        const onclick = el.getAttribute('onclick') || '';
        const match = onclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
        return match
          ? { url: match[1], text: (el.textContent || '').trim().slice(0, 40) }
          : null;
      })
      .filter((x): x is { url: string; text: string } => x !== null),
  );

  // There should be at least one navigating CTA (e.g. "See It in Action").
  expect(ctas.length, 'no navigating CTA buttons found').toBeGreaterThan(0);

  const invalid = ctas.filter((c) => {
    try {
      const u = new URL(c.url);
      return !['http:', 'https:'].includes(u.protocol);
    } catch {
      return true; // not a parseable absolute URL
    }
  });

  expect(
    invalid,
    `CTA buttons with invalid navigation URLs:\n${JSON.stringify(invalid, null, 2)}`,
  ).toEqual([]);
});

test('page loads and is usable on a mobile viewport', async ({ page }, testInfo) => {
  // The primary headline renders.
  await expect(page.locator('#page-home h1').first()).toBeVisible();

  // No horizontal overflow (allow a 2px rounding tolerance).
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(
    overflow,
    `horizontal overflow of ${overflow}px on ${testInfo.project.name}`,
  ).toBeLessThanOrEqual(2);
});
