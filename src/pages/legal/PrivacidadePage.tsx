import { Link } from 'react-router-dom'
import { CONTATO, RESPONSAVEL } from '../../utils/legal'
import { LegalLayout, Lista, Secao } from './LegalLayout'

const email = <a href={`mailto:${CONTATO}`} className="font-semibold text-brand">{CONTATO}</a>

const dados: { dado: string; uso: string; base: string }[] = [
  {
    dado: 'Nome, e-mail e senha (guardada só como hash, nunca em texto)',
    uso: 'Criar a conta, fazer login e recuperar a senha',
    base: 'Execução do contrato',
  },
  {
    dado: 'Nome da barbearia, link, horários, serviços e preços',
    uso: 'Mostrar a barbearia e calcular os horários livres',
    base: 'Execução do contrato',
  },
  {
    dado: 'Nome e telefone dos clientes da barbearia',
    uso: 'Montar a agenda e identificar quem foi atendido',
    base: 'Execução do contrato (a barbearia é a controladora)',
  },
  {
    dado: 'Agendamentos, valores e caixa',
    uso: 'Agenda, histórico e resumo financeiro do barbeiro',
    base: 'Execução do contrato',
  },
  {
    dado: 'Status do plano e identificador de cliente no Stripe',
    uso: 'Liberar o acesso pago. O número do cartão fica só com o Stripe; o ClipBook nunca o recebe',
    base: 'Execução do contrato',
  },
  {
    dado: 'Data e versão do aceite destes termos; aceite de novidades por e-mail',
    uso: 'Provar o aceite e respeitar a sua escolha',
    base: 'Cumprimento de obrigação legal e consentimento',
  },
  {
    dado: 'Endereço IP e e-mail mascarado em registros de segurança',
    uso: 'Barrar tentativas de invasão e investigar abusos',
    base: 'Legítimo interesse (segurança)',
  },
]

export function PrivacidadePage() {
  return (
    <LegalLayout
      titulo="Política de Privacidade"
      resumo="O que coletamos, por quê, com quem compartilhamos, por quanto tempo guardamos e como você exerce os seus direitos pela LGPD."
    >
      <Secao titulo="1. Quem cuida dos seus dados">
        <p>
          <strong>Controlador:</strong> {RESPONSAVEL}, responsável pelo ClipBook, para os dados
          das contas de barbeiros e clientes.
        </p>
        <p>
          <strong>Dados que cada barbearia cadastra sobre os próprios clientes</strong> (nome,
          telefone, histórico de atendimentos): a <strong>barbearia é a controladora</strong> e o
          ClipBook é o <strong>operador</strong>, tratando esses dados só para prestar o serviço à
          barbearia.
        </p>
        <p>
          <strong>Encarregado (DPO):</strong> {RESPONSAVEL}, pelo e-mail {email}.
        </p>
      </Secao>

      <Secao titulo="2. O que coletamos e para quê">
        <p>Coletamos só o necessário para a agenda funcionar. Não pedimos CPF, endereço nem documentos.</p>
        <div className="overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
            <caption className="sr-only">Dados coletados, finalidade e base legal</caption>
            <thead>
              <tr className="border-b border-line bg-screen text-[11px] uppercase tracking-[0.4px] text-muted">
                <th scope="col" className="px-3 py-2.5 font-semibold">Dado</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Para quê</th>
                <th scope="col" className="px-3 py-2.5 font-semibold">Base legal</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((linha) => (
                <tr key={linha.dado} className="border-b border-line-2 align-top last:border-0">
                  <td className="px-3 py-2.5">{linha.dado}</td>
                  <td className="px-3 py-2.5">{linha.uso}</td>
                  <td className="px-3 py-2.5">{linha.base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Secao>

      <Secao titulo="3. Com quem compartilhamos">
        <p>Não vendemos nem alugamos dados. Usamos apenas estes fornecedores, cada um com contrato de tratamento de dados:</p>
        <Lista
          itens={[
            <><strong>Amazon Web Services (AWS)</strong>: hospedagem do site, do banco de dados e envio de e-mails, na região de São Paulo.</>,
            <><strong>Stripe</strong>: processamento dos pagamentos do plano. O Stripe fica fora do Brasil (transferência internacional amparada por cláusulas contratuais padrão, art. 33 da LGPD).</>,
          ]}
        />
        <p>Também podemos compartilhar dados quando a lei ou uma ordem judicial exigir.</p>
      </Secao>

      <Secao titulo="4. Por quanto tempo guardamos">
        <Lista
          itens={[
            'Dados da conta, da barbearia e da agenda: enquanto a conta existir.',
            'Ao excluir a conta, os dados saem do banco na hora. Cópias de segurança automáticas guardam uma imagem do banco por até 7 dias e depois são apagadas.',
            'Registros de segurança (logs): 30 dias.',
            'Registros de pagamento ficam também com o Stripe, pelo prazo que as obrigações fiscais e legais dele exigem.',
          ]}
        />
      </Secao>

      <Secao titulo="5. Cookies e armazenamento">
        <p>
          Não usamos cookies de rastreamento, de estatística ou de publicidade, e nenhum serviço
          de terceiros é carregado nas páginas: até a fonte do texto é servida pelo próprio site.
          Guardamos no seu navegador apenas o necessário para manter você conectado e a sua escolha
          no aviso de cookies. Se um dia houver algo opcional, ele só será ativado depois do seu
          aceite, e recusar não muda nada no uso do site.
        </p>
      </Secao>

      <Secao titulo="6. E-mails">
        <p>
          Mandamos e-mails de serviço: recuperação de senha (só quando você pede) e o lembrete de
          renovação do Pix. Novidades e ofertas só com o seu aceite, que é separado e fica
          desmarcado no cadastro. Todo e-mail que não foi pedido por você traz um link para parar
          de receber, e você também pode mudar isso no seu perfil.
        </p>
      </Secao>

      <Secao titulo="7. Seus direitos">
        <p>Pela LGPD (art. 18) você pode, a qualquer momento e sem custo:</p>
        <Lista
          itens={[
            <><strong>Acessar e levar os seus dados</strong>: no perfil, em "Baixar meus dados" (arquivo JSON).</>,
            <><strong>Corrigir</strong>: no perfil, ou pedindo à barbearia no caso dos dados da carteira.</>,
            <><strong>Excluir</strong>: no perfil, em "Excluir minha conta".</>,
            <><strong>Revogar o consentimento</strong> de novidades e lembretes: no perfil ou pelo link do e-mail.</>,
            <><strong>Saber com quem compartilhamos</strong> e pedir qualquer outra informação: por {email}.</>,
          ]}
        />
        <p>
          Se você é cliente de uma barbearia e quer apagar o cadastro que ela fez, peça para a
          barbearia (ela pode anonimizar o cadastro no painel) ou escreva para nós, que
          encaminhamos. Respondemos em até 15 dias. Você também pode reclamar à Autoridade
          Nacional de Proteção de Dados (ANPD).
        </p>
      </Secao>

      <Secao titulo="8. Segurança e incidentes">
        <p>
          O site só funciona por HTTPS, as senhas são guardadas com hash (bcrypt), o banco e os
          discos são criptografados e o acesso à infraestrutura é restrito. Se acontecer um
          incidente de segurança que possa trazer risco ou dano relevante para você, avisamos a
          ANPD e as pessoas afetadas em até 3 dias úteis, dizendo o que aconteceu, quais dados
          foram afetados e o que estamos fazendo.
        </p>
      </Secao>

      <Secao titulo="9. Menores de idade">
        <p>
          Contas são só para maiores de 18 anos. Dados de crianças e adolescentes só entram no
          ClipBook quando a barbearia os cadastra com o consentimento de um dos pais ou
          responsável, e só o necessário para o agendamento.
        </p>
      </Secao>

      <Secao titulo="10. Mudanças nesta política">
        <p>
          Se esta política mudar, avisamos por e-mail e no site antes de a mudança valer. Leia
          também os{' '}
          <Link to="/termos" className="font-semibold text-brand">
            Termos de Uso
          </Link>
          .
        </p>
      </Secao>
    </LegalLayout>
  )
}
