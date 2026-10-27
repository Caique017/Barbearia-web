import { expect, test } from '@playwright/test'

const telasDeLogin = ['/login', '/barbeiro/login']

for (const rota of telasDeLogin) {
  test(`${rota} abre o formulário sem erro no console`, async ({ page }) => {
    const erros: string[] = []
    page.on('pageerror', (erro) => erros.push(erro.message))
    page.on('console', (mensagem) => {
      if (mensagem.type() === 'error') erros.push(mensagem.text())
    })

    await page.goto(rota)

    await expect(page.getByLabel('E-mail', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    expect(erros).toEqual([])
  })
}
