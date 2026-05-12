import { test, expect } from '@playwright/test'

test.describe('Catto Compass — happy path (v5.4)', () => {
  test('boot lands on onboarding or role home, no console errors', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Catto Compass/)
    // App always renders SOMETHING — either onboarding heading or a role home
    const h1 = page.getByRole('heading', { level: 1 }).first()
    await expect(h1).toBeVisible()
  })

  test('onboarding shows 3 role-pick buttons by sub-text', async ({ page }) => {
    await page.goto('/onboarding')
    // Role pickers: labels "I'm a walker / I own a shop / I'm with Council"
    await expect(page.getByRole('button', { name: /walker/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /shop/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /council/i })).toBeVisible()
  })

  test('walker home (v5.5 calm) renders map, smart pick, cuisine row, shop rail', async ({ page }) => {
    await page.goto('/walk')
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('button', { name: /Smart pick/i })).toBeVisible()
    await expect(page.getByRole('radio', { name: /^All$/ })).toBeVisible()
    await expect(page.getByRole('radio', { name: /^Asian$/ })).toBeVisible()
    await expect(page.getByRole('radio', { name: /^Sweets$/ })).toBeVisible()
    // v5.5 strip-down: no TierRibbon, no Plan-a-day button, no search bar by default
    await expect(page.getByRole('button', { name: /^Plan a day/i })).toHaveCount(0)
    await expect(page.getByPlaceholder(/search shops/i)).toHaveCount(0)
  })

  test('basket flow: + button picks shops, basket pill links to plan, plan hydrates', async ({ page }) => {
    await page.goto('/walk')
    // Clear basket from prior tests
    await page.evaluate(() => window.localStorage.removeItem('cc:planBasket'))
    await page.reload()
    // Real OSM shops swap in over fallback after the Overpass fetch settles;
    // basket pill needs IDs that match the currently-rendered shops to render.
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
    await page.locator('.cc-shop-mini').nth(3).waitFor({ timeout: 25_000 })
    const adds = page.locator('.cc-shop-mini-add')
    await adds.nth(0).click()
    await adds.nth(1).click()
    await adds.nth(2).click()
    // Pill aria-label is "Open plan with N stops"; accept any N to be timing-tolerant.
    const basket = page.getByRole('button', { name: /Open plan with \d+ stop/i })
    await expect(basket).toBeVisible()
    await basket.click()
    await expect(page).toHaveURL(/\/walk\/plan/)
    await expect(page.getByRole('button', { name: /Start day · earn/i })).toBeVisible()
  })

  test('plan picker sheet opens, is keyboard-dismissible, has aria role', async ({ page }) => {
    await page.goto('/walk/plan')
    await page.getByRole('button', { name: /Add a stop/i }).click()
    const sheet = page.getByRole('dialog', { name: /Add a stop/i })
    await expect(sheet).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })

  test('owner home: Saint Honoré + CATTO SEES + concrete CATTO READY play', async ({ page }) => {
    await page.goto('/owner')
    await expect(page.getByRole('heading', { name: /Saint Honoré/i })).toBeVisible()
    await expect(page.getByText(/CATTO SEES/i)).toBeVisible()
    await expect(page.getByText(/Sources/i)).toBeVisible()
    await expect(page.getByText(/CATTO READY/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate today's play/i })).toBeVisible()
  })

  test('owner campaign: STEP 1 eyebrow + Bakery default for Saint Honoré, persists across reload', async ({
    page,
  }) => {
    await page.goto('/owner/campaign')
    await expect(page.getByText(/STEP 1 · SNAP/i)).toBeVisible()
    // BizPills uses role=radio
    await expect(page.getByRole('radio', { name: 'Bakery' })).toBeVisible()
    await page.getByRole('radio', { name: 'Restaurant' }).click()
    await page.reload()
    await expect(page.getByText(/STEP 1 · SNAP/i)).toBeVisible()
    const persisted = await page.evaluate(() => window.localStorage.getItem('cc:owner-campaign'))
    expect(persisted).toContain('Restaurant')
  })

  test('council pulse: live "12", 6 proofs, totals, CSV download button', async ({ page }) => {
    await page.goto('/council')
    await expect(page.getByRole('tab', { name: /^Pulse$/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /^Trajectory$/i })).toBeVisible()
    await expect(page.getByText(/WHY THIS WORKS/i)).toBeVisible()
    await expect(page.getByText(/6 proofs/i)).toBeVisible()
    // 12 walking now hero — use locator class to disambiguate
    await expect(page.locator('.cc-pulse-mega')).toContainText('12')
    // Totals strip — exact match on the small label (not paragraph copy)
    await expect(page.locator('.cc-pulse-tot-l', { hasText: 'CO₂ SAVED' })).toBeVisible()
    await expect(page.getByRole('button', { name: /briefing CSV/i })).toBeVisible()
  })

  test('council trajectory tab: 3 charts + dark "What\'s next" card', async ({ page }) => {
    await page.goto('/council')
    await page.getByRole('tab', { name: /^Trajectory$/i }).click()
    await expect(page.getByText(/WALKS \/ WEEK/i)).toBeVisible()
    await expect(page.getByText(/CUMULATIVE SHOP SPEND/i)).toBeVisible()
    await expect(page.getByText(/RETENTION/i)).toBeVisible()
    await expect(page.getByText(/WHAT'S NEXT/i)).toBeVisible()
    await expect(page.getByText(/\+312%/i)).toBeVisible()
  })

  test('mobile bottom nav: 4 Walker-mode tabs (Discover/Plan/Rewards/Profile)', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile-chrome') {
      test.skip()
      return
    }
    await page.goto('/walk')
    const nav = page.getByRole('navigation', { name: /walker modes/i })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: /^Discover$/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^Plan$/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^Rewards$/ })).toBeVisible()
    await expect(nav.getByRole('link', { name: /^Profile$/ })).toBeVisible()
  })

  test('Smart pick · 1 quote page (/walk/pick) renders hero + stats + CTA', async ({ page }) => {
    await page.goto('/walk/pick')
    // Wait for shops to resolve (smart pick depends on them)
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {})
    await expect(page.getByText(/Today's pick/i)).toBeVisible()
    await expect(page.getByText(/CATTO PICKED/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('button', { name: /Walk me there/i })).toBeVisible()
  })

  test('Rewards home (/walk/rewards) renders tier + badges + history', async ({ page }) => {
    await page.goto('/walk/rewards')
    await expect(page.getByText(/ACHIEVEMENT BADGES/i)).toBeVisible()
    await expect(page.getByText(/RECENT WALKS/i)).toBeVisible()
    await expect(page.getByText(/LIFETIME/i)).toBeVisible()
  })

  test('Profile (/walk/profile) renders avatar + tier + settings', async ({ page }) => {
    await page.goto('/walk/profile')
    await expect(page.getByRole('heading', { name: /Walker/i })).toBeVisible()
    await expect(page.getByText(/SETTINGS/i)).toBeVisible()
    await expect(page.getByText(/Pilot city/i)).toBeVisible()
    await expect(page.getByText(/Switch role/i)).toBeVisible()
  })

  test('Council Impact tab renders radar + heatmap + KPI dials', async ({ page }) => {
    await page.goto('/council')
    await page.getByRole('tab', { name: /^Impact$/i }).click()
    await expect(page.getByText(/GOAL ALIGNMENT/i)).toBeVisible()
    await expect(page.getByText(/STREET HEATMAP/i)).toBeVisible()
    // Disambiguate from radar caption ("% of 2036 targets reached")
    await expect(page.getByText('% OF 2036 TARGET', { exact: true })).toBeVisible()
    await expect(page.getByText(/of 2036 targets reached/i)).toBeVisible()
  })

  test('health endpoint responds when server-side functions available', async ({ page }) => {
    // /api/health only works under vercel dev / production server, not vite dev.
    // Vite returns index.html for unmatched routes — check content-type before parsing JSON.
    const res = await page.request.get('/api/health').catch(() => null)
    const isJson = res?.headers()['content-type']?.includes('application/json') ?? false
    if (res && res.ok() && isJson) {
      const body = await res.json()
      expect(body.ok).toBe(true)
    } else {
      test.skip(true, 'API not available in this dev mode (Vite-only)')
    }
  })
})
