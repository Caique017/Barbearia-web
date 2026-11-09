import { Link } from 'react-router-dom'
import { CONTATO, RESPONSAVEL } from '../../utils/legal'
import { LegalLayout, Lista, Secao } from './LegalLayout'

const email = <a href={`mailto:${CONTATO}`} className="font-semibold text-brand">{CONTATO}</a>

export function TermosPage() {
  return (
    <LegalLayout
      titulo="Termos de Uso"
      resumo="As regras para usar o ClipBook, escritas para serem lidas. Ao criar uma conta você concorda com elas."
    >
      <Secao titulo="1. Quem oferece o ClipBook">
        <p>
          O ClipBook é oferecido por {RESPONSAVEL}, pessoa física. Para qualquer dúvida, pedido ou
          reclamação, escreva para {email}. Respondemos em até 15 dias.
        </p>
      </Secao>

      <Secao titulo="2. O que é o serviço">
        <p>
          O ClipBook é uma agenda online para barbearias. O <strong>barbeiro</strong> organiza
          serviços, horários, clientes e o caixa da barbearia. O <strong>cliente</strong> cria uma
          conta pelo link da barbearia para agendar, cancelar e remarcar horários. Para o cliente,
          o ClipBook é gratuito.
        </p>
        <p>
          O ClipBook não cobra nem intermedeia o pagamento do corte: isso é combinado entre o
          cliente e a barbearia.
        </p>
      </Secao>

      <Secao titulo="3. Quem pode criar conta">
        <Lista
          itens={[
            'É preciso ter 18 anos ou mais para criar uma conta.',
            'Menores de idade podem ser atendidos normalmente: nesse caso, quem cadastra o menor é a barbearia, com os dados e a autorização do responsável.',
            'Você responde pela veracidade dos dados informados e pela guarda da sua senha. Se suspeitar de uso indevido, troque a senha e use "Sair de todos os dispositivos".',
          ]}
        />
      </Secao>

      <Secao titulo="4. Plano do barbeiro e preço">
        <Lista
          itens={[
            <>
              <strong>7 dias grátis</strong>, sem cartão, a partir do cadastro. Ao fim do teste nada
              é cobrado automaticamente.
            </>,
            <>
              Depois, <strong>R$ 29,99 por mês</strong>. Esse é o preço final: não há taxa de
              adesão, de cancelamento nem cobrança escondida.
            </>,
            <>
              <strong>No cartão, a assinatura se renova automaticamente</strong> todo mês, no mesmo
              dia, pelo mesmo valor, até você cancelar. Isso é avisado na tela do plano antes do
              pagamento.
            </>,
            <>
              <strong>No Pix</strong>, cada pagamento libera 30 dias e não se renova sozinho. Mandamos
              um lembrete por e-mail 3 dias antes do fim.
            </>,
            'Se o preço mudar, avisamos por e-mail com pelo menos 30 dias de antecedência. Quem não concordar pode cancelar sem custo.',
          ]}
        />
      </Secao>

      <Secao titulo="5. Como cancelar">
        <p>
          O cancelamento é feito no mesmo lugar onde você assinou: em{' '}
          <strong>Plano → Gerenciar pagamento</strong>, sem precisar falar com ninguém. O acesso
          continua até o fim do período já pago e não há cobrança depois disso. Se preferir, peça
          o cancelamento por {email}.
        </p>
      </Secao>

      <Secao titulo="6. Direito de arrependimento (7 dias)">
        <p>
          Como a contratação é feita pela internet, você pode desistir em até{' '}
          <strong>7 dias contados do pagamento</strong> (art. 49 do Código de Defesa do Consumidor)
          e receber de volta o valor integral. Basta pedir por {email} com o e-mail da sua conta.
          O estorno é feito pelo mesmo meio de pagamento usado.
        </p>
      </Secao>

      <Secao titulo="7. Quando o plano vence">
        <p>
          Sem plano ativo, a conta do barbeiro fica <strong>só para leitura</strong>: dá para ver
          tudo, mas não criar ou alterar agendamentos, e os clientes não conseguem agendar online.
          Nada é apagado. Ao renovar, tudo volta a funcionar como antes.
        </p>
      </Secao>

      <Secao titulo="8. Responsabilidades">
        <Lista
          itens={[
            'O barbeiro é responsável pelo atendimento, pelos preços que cobra e pelos dados dos clientes que cadastra. Em relação a esses dados, a barbearia é a controladora e o ClipBook é o operador (veja a Política de Privacidade).',
            'Não é permitido usar o ClipBook para enviar spam, cadastrar pessoas sem o conhecimento delas, se passar por outra pessoa ou tentar acessar dados de outras contas.',
            'Trabalhamos para manter o serviço no ar o tempo todo, mas pode haver interrupções para manutenção ou por falhas de terceiros. Não prometemos disponibilidade de 100%.',
          ]}
        />
      </Secao>

      <Secao titulo="9. Encerrar a conta">
        <p>
          Você pode baixar os seus dados e excluir a conta a qualquer momento, no seu perfil. A
          exclusão do barbeiro cancela a assinatura e apaga a barbearia. A do cliente cancela os
          agendamentos futuros e desliga a conta; o cadastro na carteira continua com a barbearia,
          que pode anonimizá-lo a pedido. Podemos suspender contas que descumpram estes termos,
          avisando antes sempre que possível.
        </p>
      </Secao>

      <Secao titulo="10. Mudanças e lei aplicável">
        <p>
          Se estes termos mudarem, avisamos por e-mail e no próprio site antes de a mudança valer.
          Vale a lei brasileira, e o foro é o do seu domicílio. Leia também a{' '}
          <Link to="/privacidade" className="font-semibold text-brand">
            Política de Privacidade
          </Link>
          .
        </p>
      </Secao>
    </LegalLayout>
  )
}
