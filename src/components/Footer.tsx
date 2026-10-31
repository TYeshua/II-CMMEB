import { credits } from '../data/content'
import { Arrow } from './Logo'
import { Ph } from './Ph'

const NAV: [string, [string, string][]][] = [
  ['Congresso', [['#sobre', 'Sobre'], ['#industria', 'Indústria'], ['#margem', 'Margem'], ['#ambiente', 'Ambiente'], ['#eixos', 'Eixos temáticos']]],
  ['Participe', [['#palestrantes', 'Palestrantes'], ['#programacao', 'Programação'], ['#inscricoes', 'Inscrições'], ['#local', 'Local'], ['#duvidas', 'Dúvidas']]],
]

/**
 * O fim da descida: um card vermelho de largura total que, à direita, se desfaz em pontos
 * sobre a formação rochosa onde a broca está entrando (ver .foot-dissolve no CSS).
 */
export function Footer() {
  return (
    <footer data-chapter data-bg="#c4352a" data-ink="#f2f9fb" className="foot-dissolve text-paper">
      <div className="wrap max-w-[80vw] pb-6 pt-[clamp(40px,5vw,72px)] lg:max-w-[60vw]">
        <p className="foot-mark font-black" aria-hidden="true">II CMMEB</p>
        <div className="grid12 mt-8 gap-y-8">
          <div className="col-span-12 md:col-span-6">
            <h2 className="t-body font-medium">II Congresso de Ciências do Mar na Margem Equatorial Brasileira</h2>
            <p className="t-item mt-3">
              <a href="https://cmmeb.com.br" target="_blank" rel="noreferrer" className="no-underline hover:underline">cmmeb.com.br</a>
              <span className="mx-2 opacity-60" aria-hidden="true">·</span>
              <a href="#local" className="no-underline hover:underline">Salinópolis, PA</a>
            </p>
            <p className="t-small mt-3"><Ph id="contato" /></p>
            <a href="#inscricoes" className="btn btn-sun mt-6">Quero me inscrever <Arrow /></a>
          </div>
          <nav aria-label="Rodapé" className="col-span-12 grid grid-cols-2 gap-6 md:col-span-5 md:col-start-8">
            {NAV.map(([title, links]) => (
              <div key={title}>
                <h3 className="t-small font-medium text-foam">{title}</h3>
                <ul className="mt-3 grid gap-1.5 t-small">
                  {links.map(([h, l]) => <li key={h}><a href={h} className="no-underline hover:underline">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="t-small mt-10 max-w-[78ch] text-foam">
          Fotografias:{' '}
          {credits.map((c, i) => (
            <span key={c.url}>
              <a href={c.url} target="_blank" rel="noreferrer">{c.what}</a>, {c.author}, {c.licence}{i < credits.length - 1 ? '; ' : '. '}
            </span>
          ))}
          Ilustrações e cenas 3D esquemáticas, fora de escala. Costa: Natural Earth; estados: IBGE; bacias sedimentares: ANP.
        </p>
        <div className="t-small mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 text-foam">
          <span>© 2027 II CMMEB · Departamento de Oceanografia e Limnologia, UFMA</span>
          <span className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#inicio">Voltar ao topo</a>
            <a href="https://tyeshua.github.io/DOF-Portifolio/" target="_blank" rel="noopener noreferrer" className="btn btn-sun !min-h-[44px] !px-4 text-[length:var(--step-small)]">
              Desenvolvido por Thiago Yeshua <Arrow />
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
