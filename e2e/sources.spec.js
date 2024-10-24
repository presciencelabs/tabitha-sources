// https://playwright.dev/docs/writing-tests#first-test
// @ts-check
import { test, expect } from '@playwright/test'

// https://playwright.dev/docs/test-fixtures#built-in-fixtures
test('get all sources', async ({ request }) => {
	const response = await request.get('/')

	const sources = await response.json()

	// https://playwright.dev/docs/api/class-genericassertions#generic-assertions-to-equal
	expect(sources).toEqual([
		{ 'type': 'Bible' },
	])
})
