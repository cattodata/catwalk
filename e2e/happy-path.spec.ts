import { test, expect, type Page } from '@playwright/test'

/** Helper: switch mode regardless of desktop tabs vs mobile bottom nav. */
async function switchMode(page: Page, mode: 'walk' | 'shop' | 'council') {
  // Use URL navigation — works identically across viewports
  const url = new URL(page.url())
  url.searchParams.set('mode', mode)
  await page.goto(url.pathname + url.search)
}

test.describe('Catto Compass — happy path', () => {
  test('app boots, all 3 modes accessible, walk flow completes', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Catto Compass/)
    await expect(page.locator('h1')).toContainText('Walk Chatswood')

    const vitalsCards = page.locator('.cc-vital')
    await expect(vitalsCards).toHaveCount(4)

    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15000 })

    // Smart Pick → auto-selects a shop
    await page.getByRole('button', { name: /Smart pick for now/ }).click()
    await expect(page.locator('.cc-shop-card h2')).toBeVisible()

    // Start the walk → arrived → claim reward (overlay appears)
    await page.getByRole('button', { name: /Start the/ }).click()
    await page.getByRole('button', { name: /arrived/i }).click({ timeout: 15000 })
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.locator('.cc-reward-card h3')).toContainText('pts!')

    // Close reward
    await page.getByRole('button', { name: /Show this code/ }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('switching to Shop Booster mode shows insights + competitor radar', async ({ page }) => {
    await page.goto('/')
    await switchMode(page, 'shop')

    await expect(page.getByText(/YOUR SHOP/)).toBeVisible()
    await expect(page.getByText(/What Catto sees right now/)).toBeVisible()

    // Competitor radar uses real Overpass — may take a while on cold cache
    await expect(page.getByText(/Competitor radar/)).toBeVisible({ timeout: 30000 })
    await expect(page.getByText(/Today's demand forecast/)).toBeVisible()
  })

  test('Council View shows live aggregate dashboard', async ({ page }) => {
    await page.goto('/')
    await switchMode(page, 'council')

    await expect(page.getByText(/Boosted streets right now/)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Chatswood pilot — at a glance/)).toBeVisible({ timeout: 10000 })
    const kpis = page.locator('.cco-kpi')
    await expect(kpis).toHaveCount(4)
  })

  test('mobile bottom nav is visible and works on small screens', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile-chrome') {
      test.skip()
      return
    }
    await page.goto('/')
    const mobileNav = page.locator('.cc-mobile-nav')
    await expect(mobileNav).toBeVisible()
    await mobileNav.getByText(/Council/).click()
    await expect(page.getByText(/Boosted streets right now/)).toBeVisible({ timeout: 10000 })
  })

  test('health endpoint responds when server-side functions available', async ({ page }) => {
    // /api/health only works under vercel dev / production server, not vite dev
    const res = await page.request.get('/api/health').catch(() => null)
    if (res && res.ok()) {
      const body = await res.json()
      expect(body.ok).toBe(true)
    } else {
      test.skip(true, 'API not available in this dev mode (Vite-only)')
    }
  })
})
