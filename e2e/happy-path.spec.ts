import { test, expect } from '@playwright/test'

test.describe('Catto Compass — happy path', () => {
  test('app boots, all 3 modes accessible, walk flow completes', async ({ page }) => {
    await page.goto('/')

    // Title and hero
    await expect(page).toHaveTitle(/Catto Compass/)
    await expect(page.locator('h1')).toContainText('Walk Chatswood')

    // Vitals strip — 4 cards
    const vitalsCards = page.locator('.cc-vital')
    await expect(vitalsCards).toHaveCount(4)

    // Map renders (Leaflet container)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })

    // Smart Pick → auto-selects a shop
    await page.getByRole('button', { name: /Smart pick for now/ }).click()
    await expect(page.locator('.cc-shop-card h2')).toBeVisible()

    // Start the walk → arrived → claim reward (overlay appears)
    await page.getByRole('button', { name: /Start the/ }).click()
    await page.getByRole('button', { name: /arrived/i }).click({ timeout: 10000 })
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.locator('.cc-reward-card h3')).toContainText('pts!')

    // Close reward
    await page.getByRole('button', { name: /Show this code/ }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('switching to Shop Booster mode shows insights + competitor radar', async ({ page }) => {
    await page.goto('/')

    // Switch tab
    await page.getByRole('tab', { name: /Shop Booster/ }).click()

    // Step 1 indicator visible
    await expect(page.getByText(/YOUR SHOP/)).toBeVisible()

    // Insights panel visible
    await expect(page.getByText(/What Catto sees right now/)).toBeVisible()

    // Competitor radar visible (uses real Overpass data — may take 10s)
    await expect(page.getByText(/Competitor radar/)).toBeVisible({ timeout: 15000 })

    // Demand forecast visible
    await expect(page.getByText(/Today's demand forecast/)).toBeVisible()
  })

  test('Council View shows live aggregate dashboard', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('tab', { name: /Council View/ }).click()

    // Council heading visible
    await expect(page.getByText(/Boosted streets right now/)).toBeVisible()

    // Dashboard KPI cards (lazy-loaded, may take a moment)
    await expect(page.getByText(/Chatswood pilot — at a glance/)).toBeVisible({ timeout: 10000 })
    const kpis = page.locator('.cco-kpi')
    await expect(kpis).toHaveCount(4)
  })

  test('mobile bottom nav is visible and works on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const mobileNav = page.locator('.cc-mobile-nav')
    await expect(mobileNav).toBeVisible()

    // Tap Council nav button
    await mobileNav.getByText(/Council/).click()
    await expect(page.getByText(/Boosted streets right now/)).toBeVisible({ timeout: 5000 })
  })
})
