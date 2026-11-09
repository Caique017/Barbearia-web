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

const paginasLegais = [
  { rota: '/termos', titulo: 'Termos de Uso' },
  { rota: '/privacidade', titulo: 'Política de Privacidade' },
]

for (const { rota, titulo } of paginasLegais) {
  test(`${rota} abre sem erro e o aviso de cookies tem recusar`, async ({ page }) => {
    const erros: string[] = []
    page.on('pageerror', (erro) => erros.push(erro.message))

    await page.goto(rota)

    await expect(page.getByRole('heading', { level: 1, name: titulo })).toBeVisible()
    await page.getByRole('button', { name: 'Recusar opcionais' }).click()
    await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toHaveCount(0)
    expect(erros).toEqual([])
  })
}

test('cadastro do barbeiro exige o aceite dos termos', async ({ page }) => {
  await page.goto('/barbeiro/cadastro')

  await expect(page.getByRole('checkbox', { name: /Tenho 18 anos ou mais/ })).not.toBeChecked()
  await expect(page.getByRole('checkbox', { name: /novidades/ })).not.toBeChecked()
  await page.getByRole('button', { name: 'Criar barbearia' }).click()
  await expect(page.getByText('Confirme que tem 18 anos ou mais e aceite os termos')).toBeVisible()
})
