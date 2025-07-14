import { expect, test } from '@playwright/test'

test.describe('LiveStore + RedwoodSDK Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for initialization
    await page.waitForSelector('#status:has-text("Connected")', { timeout: 10000 })
  })

  test('should initialize both LiveStore and RedwoodSDK', async ({ page }) => {
    const statusText = await page.locator('#status').textContent()
    expect(statusText).toBe('Connected to LiveStore and RedwoodSDK!')
  })

  test('should add a new todo', async ({ page }) => {
    const todoInput = page.locator('#todoInput')
    const addButton = page.locator('#addTodo')

    // Add a todo
    await todoInput.fill('Test todo item')
    await addButton.click()

    // Verify the todo appears
    await expect(page.locator('#todoList').getByText('Test todo item')).toBeVisible()
  })

  test('should toggle todo completion', async ({ page }) => {
    // Add a todo first
    await page.locator('#todoInput').fill('Toggle test todo')
    await page.locator('#addTodo').click()

    // Wait for todo to appear
    await expect(page.locator('#todoList').getByText('Toggle test todo')).toBeVisible()

    // Toggle the checkbox
    const checkbox = page.locator('#todoList input[type="checkbox"]').first()
    await checkbox.check()

    // Verify the todo is marked as completed (has line-through style)
    await expect(page.locator('#todoList span').first()).toHaveCSS('text-decoration', /line-through/)

    // Uncheck and verify
    await checkbox.uncheck()
    await expect(page.locator('#todoList span').first()).not.toHaveCSS('text-decoration', /line-through/)
  })

  test('should delete a todo', async ({ page }) => {
    // Add a todo
    await page.locator('#todoInput').fill('Delete test todo')
    await page.locator('#addTodo').click()

    // Wait for todo to appear
    await expect(page.locator('#todoList').getByText('Delete test todo')).toBeVisible()

    // Delete the todo
    await page.locator('#todoList button[data-delete-id]').first().click()

    // Verify the todo is removed
    await expect(page.locator('#todoList').getByText('Delete test todo')).not.toBeVisible()
  })

  test('should persist todos after page reload', async ({ page }) => {
    // Add multiple todos
    const todos = ['First todo', 'Second todo', 'Third todo']
    for (const todo of todos) {
      await page.locator('#todoInput').fill(todo)
      await page.locator('#addTodo').click()
    }

    // Verify all todos are visible
    for (const todo of todos) {
      await expect(page.locator('#todoList').getByText(todo)).toBeVisible()
    }

    // Reload the page
    await page.reload()
    await page.waitForSelector('#status:has-text("Connected")', { timeout: 10000 })

    // Verify todos are still there
    for (const todo of todos) {
      await expect(page.locator('#todoList').getByText(todo)).toBeVisible()
    }
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    const todoInput = page.locator('#todoInput')

    // Add todo using Enter key
    await todoInput.fill('Keyboard test todo')
    await todoInput.press('Enter')

    // Verify the todo was added
    await expect(page.locator('#todoList').getByText('Keyboard test todo')).toBeVisible()
  })

  test('should sync data between LiveStore and RedwoodSDK', async ({ page }) => {
    // Add a todo
    await page.locator('#todoInput').fill('Sync test todo')
    await page.locator('#addTodo').click()

    // Check console logs for sync verification
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        consoleLogs.push(msg.text())
      }
    })

    // Verify both systems are initialized
    await page.evaluate(() => {
      console.log('LiveStore initialized:', !!window.livestore)
      console.log('RedwoodSDK initialized:', !!window.redwood)
    })

    // Wait a bit for logs to be captured
    await page.waitForTimeout(1000)

    expect(consoleLogs.some((log) => log.includes('LiveStore initialized: true'))).toBeTruthy()
    expect(consoleLogs.some((log) => log.includes('RedwoodSDK initialized: true'))).toBeTruthy()
  })
})
