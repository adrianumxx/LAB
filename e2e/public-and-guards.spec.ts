import { expect, test } from '@playwright/test'

test.describe('Marketing & documenti pubblici', () => {
  test('home: H1 visibile e CTA principale', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Accedi alla piattaforma/i })).toBeVisible()
  })

  test('role-entry: titolo e tre percorsi ruolo', async ({ page }) => {
    await page.goto('/role-entry')
    await expect(page.getByRole('heading', { name: /Chi sei in questo affitto/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Property manager/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Proprietario/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Inquilino/i })).toBeVisible()
  })

  test('login e signup caricano', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { level: 1, name: /Bentornato/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await page.goto('/signup?role=manager')
    await expect(page.getByRole('heading', { level: 1, name: /Crea account/i })).toBeVisible()
    await expect(page.getByLabel(/full name/i)).toBeVisible()
  })

  test('privacy e terms', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.goto('/terms')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('sitemap e robots rispondono', async ({ request }) => {
    const sm = await request.get('/sitemap.xml')
    expect(sm.ok()).toBeTruthy()
    const rb = await request.get('/robots.txt')
    expect(rb.ok()).toBeTruthy()
  })
})

test.describe('Guard dashboard senza sessione (RoleGuard client)', () => {
  test('manager redirect a role-entry', async ({ page }) => {
    await page.goto('/manager')
    await page.waitForURL('**/role-entry', { timeout: 15_000 })
    expect(page.url()).toContain('/role-entry')
  })

  test('owner redirect a role-entry', async ({ page }) => {
    await page.goto('/owner')
    await page.waitForURL('**/role-entry', { timeout: 15_000 })
    expect(page.url()).toContain('/role-entry')
  })

  test('tenant redirect a role-entry', async ({ page }) => {
    await page.goto('/tenant')
    await page.waitForURL('**/role-entry', { timeout: 15_000 })
    expect(page.url()).toContain('/role-entry')
  })

  test('account preferences redirect senza login', async ({ page }) => {
    await page.goto('/account/preferences')
    await page.waitForURL('**/role-entry', { timeout: 15_000 })
    expect(page.url()).toContain('/role-entry')
  })
})

test.describe('Viewport stretta (smoke layout)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('landing: nessuna scroll orizzontale eccessiva', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
