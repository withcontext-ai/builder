import { expect, test } from '@playwright/test'

const timeout = 10_000

test('test', async ({ page }) => {
  await page.goto('/explore')
  await page.getByRole('link', { name: 'E', exact: true }).click()
  const input = page.getByPlaceholder('Type a message')
  await input.click()
  await input.fill('hi')
  await page.getByRole('button', { name: 'Send' }).click()
  expect(await input.textContent()).toBe('')
  const messages = await page.getByTestId('chat-card-content').all()
  const lastMessage = messages[messages.length - 1]
  const secondLastMessage = messages[messages.length - 2]
  expect(await secondLastMessage.textContent()).toContain('hi')
  await expect(lastMessage.getByTestId('chat-card-loading')).toBeVisible({
    timeout,
  })
  await expect(lastMessage.getByTestId('chat-card-loading')).not.toBeVisible({
    timeout,
  })

  await page.getByRole('button', { name: 'Regenerate response' }).click()
  const loading = page
    .getByTestId('chat-card-content')
    .last()
    .getByTestId('chat-card-loading')
  expect(loading).toBeInViewport()
  await expect(loading).not.toBeVisible({ timeout })

  await page.getByPlaceholder('Type a message').click()
  await page.getByPlaceholder('Type a message').fill('what')
  await page.getByRole('button', { name: 'Send', disabled: false }).click()
  const messages2 = await page.getByTestId('chat-card-content').all()
  const lastMessage2 = messages2[messages2.length - 1]
  await expect(lastMessage2.getByTestId('chat-card-loading')).toBeVisible({
    timeout,
  })
  await page.getByRole('button', { name: 'Stop generating' }).click()
  await expect(lastMessage2).not.toBeVisible({ timeout })
})
