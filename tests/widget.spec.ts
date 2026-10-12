import { test, expect } from '@playwright/test';
import { WidgetPage } from './widget.page';

test.describe('Uchi.ru widget', () => {
  let widgetPage: WidgetPage;

  test.beforeEach(async ({ page }) => {
    widgetPage = new WidgetPage(page);
        await page.context().addCookies([{
      name: 'ab_mainpage_redesign',
      value: 'a',
      url: 'https://uchi.ru/',
    }]);

    await page.addLocatorHandler(
    page.locator('._UCHI_COOKIE__wrap:not(._UCHI_COOKIE__wrap--fake) ._UCHI_COOKIE__button'),
      async button => {
        await button.click();
      }
    );

    const response = await page.goto('/', {
      waitUntil: 'commit',
    });

    expect(
      response?.ok(),
      `HTTP response: ${response?.status()}`
    ).toBeTruthy();

    await expect(
      page.locator('[data-test="openWidget"]')
    ).toBeVisible({ timeout: 15_000 });
  });

  test('opens', async () => {
    await widgetPage.openWidget();
    await expect(widgetPage.getWidgetBody()).toBeVisible();
  });

  test('has correct title', async () => {
    await widgetPage.openWidget();

    const articles = widgetPage.getPopularArticles();
    await articles.first().click();

    await widgetPage.clickWriteToUs();

    await expect(widgetPage.getTitle())
      .toHaveText('Связь с поддержкой');
  });

  test('closes and reopens', async ({ page }) => {
    await widgetPage.openWidget();
    await expect(widgetPage.getWidgetBody()).toBeVisible();

    await page
      .locator('[class^="widgetWrapper"] > button[class^="closeBtn__"]')
      .click();

    await expect(widgetPage.getWidgetBody()).toBeHidden();

    await widgetPage.openWidget();
    await expect(widgetPage.getWidgetBody()).toBeVisible();
    await expect(widgetPage.getTitle())
      .toHaveText('База знаний Учи.ру');
  });
});