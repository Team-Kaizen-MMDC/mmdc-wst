const { test, expect } = require('@playwright/test');

test.describe('Accessibility smoke', () => {
  const pages = ['/', '/pages/jobs/job.html', '/pages/companies/ana.html'];

  for (const p of pages) {
    test(`axe scan ${p}`, async ({ page, baseURL }) => {
      // navigate
      await page.goto(p);

      // inject axe-core from CDN
      await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js' });

      // run axe
      const result = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        return await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2aa'] } });
      });

      // If violations exist, create a readable message and fail the test
      if (result.violations && result.violations.length) {
        const messages = result.violations.map(v => `${v.id}: ${v.help} (impact: ${v.impact})\n  Targets: ${v.nodes.map(n => n.target.join(', ')).join('; ')}`);
        console.error('Accessibility violations:\n', messages.join('\n\n'));
      }

      expect(result.violations.length, 'No axe a11y violations').toBe(0);
    });
  }
});
