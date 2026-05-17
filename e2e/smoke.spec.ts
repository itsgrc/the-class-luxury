import { test, expect } from '@playwright/test'

test('Homepage loads and shows hero text', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=senza confini')).toBeVisible({ timeout: 10000 })
})

test('/servizi page loads with at least 1 card', async ({ page }) => {
  await page.goto('/servizi')
  await expect(page.locator('[data-testid="service-card"], .card-shine').first()).toBeVisible({ timeout: 10000 })
})

test('Price slider exists in /servizi', async ({ page }) => {
  await page.goto('/servizi')
  await expect(page.locator('[role="slider"]').first()).toBeVisible({ timeout: 10000 })
})

test('/concierge page loads', async ({ page }) => {
  await page.goto('/concierge')
  await expect(page).toHaveURL('/concierge')
  await expect(page.locator('body')).toBeVisible()
})

test('/preferiti page loads', async ({ page }) => {
  await page.goto('/preferiti')
  await expect(page).toHaveURL('/preferiti')
  await expect(page.locator('body')).toBeVisible()
})

test('Dark mode toggle works', async ({ page }) => {
  await page.goto('/')
  // Find and click the dark mode toggle button (Moon/Sun icon)
  const toggleBtn = page.locator('button[aria-label="Cambia tema"]')
  await toggleBtn.waitFor({ timeout: 10000 })
  await toggleBtn.click()
  // The html element should now have data-theme="dark"
  await expect(page.locator('html[data-theme="dark"]')).toBeVisible({ timeout: 5000 })
})

test('/stories page loads', async ({ page }) => {
  await page.goto('/stories')
  await expect(page).toHaveURL('/stories')
  await expect(page.locator('body')).toBeVisible()
})

test('/mindmap page loads with SVG', async ({ page }) => {
  await page.goto('/mindmap')
  await expect(page.locator('svg')).toBeVisible({ timeout: 10000 })
})

test('AI concierge button exists', async ({ page }) => {
  await page.goto('/')
  // AIConcierge component renders a button
  await expect(page.locator('button[aria-label*="concierge"], button[aria-label*="Concierge"], button[aria-label*="AI"]').first()).toBeVisible({ timeout: 10000 })
})

test('/quiz page loads', async ({ page }) => {
  await page.goto('/quiz')
  await expect(page).toHaveURL('/quiz')
  await expect(page.locator('body')).toBeVisible()
})
