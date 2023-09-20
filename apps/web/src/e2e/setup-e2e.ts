import path from 'path'
import { expect, test } from '@playwright/test'
import dotenv from 'dotenv'

// local
dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env.local'),
})

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!
const authFile = 'playwright/.auth/user.json'

test('logged in', async ({ page }) => {
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/.*sign-in/)
  await page.getByLabel('Email address').fill(E2E_USERNAME)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Password', { exact: true }).fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page).toHaveURL(/.*explore/, { timeout: 10000 })
  await page.context().storageState({ path: authFile })
})
