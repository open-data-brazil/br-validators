import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('locale', 'en');
    localStorage.setItem('theme', 'dark');
  });
});

test('home page loads welcome panel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'CPF validator' })).toBeVisible();
});

test('CPF document workspace loads', async ({ page }) => {
  await page.goto('/cpf');
  await expect(page.getByRole('heading', { name: 'CPF Validator' })).toBeVisible();
  await expect(page.getByLabel('Input')).toBeVisible();
});

test('CNPJ document workspace loads', async ({ page }) => {
  await page.goto('/cnpj');
  await expect(page.getByRole('heading', { name: 'CNPJ Validator' })).toBeVisible();
});

test('reference data IBGE page loads', async ({ page }) => {
  await page.goto('/data/ibge');
  await expect(page.getByRole('heading', { name: 'IBGE localities' })).toBeVisible();
});

test('sidebar navigates from home to PIX', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'PIX key + QR code' }).click();
  await expect(page).toHaveURL(/\/pix$/);
  await expect(page.getByRole('heading', { name: 'PIX key Validator' })).toBeVisible();
});
