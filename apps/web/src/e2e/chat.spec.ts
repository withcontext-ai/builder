import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/explore')
  await page.getByRole('link', { name: 'E', exact: true }).click()

  await page.getByPlaceholder('Type a message').click()
  await page.getByPlaceholder('Type a message').fill('hi')
  await page.getByRole('button', { name: 'Send' }).click()
  const messages = await page.getByTestId('chat-card-content').all()
  const lastMessage = messages[messages.length - 1]
  const secondLastMessage = messages[messages.length - 2]
  expect(await secondLastMessage.textContent()).toContain('hi')
  expect(lastMessage.getByTestId('chat-card-loading')).toBeInViewport()
  await expect(lastMessage.getByTestId('chat-card-loading')).not.toBeVisible()
  await page.getByRole('button', { name: 'Regenerate response' }).click()
  await page.getByPlaceholder('Type a message').click()
  await page.getByPlaceholder('Type a message').fill('what')
  await page.getByRole('button', { name: 'Send', disabled: false }).click()
})
