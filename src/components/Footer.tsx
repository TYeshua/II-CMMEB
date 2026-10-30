import { credits } from '../data/content'
import { Arrow } from './Logo'
import { Ph } from './Ph'

/**
 * O fim da descida: um card vermelho de largura total que, à direita, se desfaz em pontos
 * sobre a formação rochosa onde a broca está entrando (ver .foot-dissolve no CSS).
 */
export function Footer() {
  return (
    <footer data-chapter data-bg="#c4352a" data-ink="#f2f9fb" className="foot-dissolve text-paper">
      <div className="wrap max-w-[80vw] pb-6 pt-[clamp(48px,5vw,80px)] lg:max-w-[60vw]">
        <p className="font-black leading-[0.8] tracking-[-0.05em] text-[22vw] lg:text-[9.5vw]" aria-hidden="true">CMMEB</p>
        <div className="grid12 mt-10 gap-y-10">
          <div className="col-span-12 md:col-span-5">
            <h2 className="t-body font-medium">II Congresso de Ciências do Mar na Margem Equatorial Brasileira</h2>
            <ul className="mt-4 grid gap-1 fs-lead font-black leading-tight tracking-tight">
              <li><a href="https://cmmeb.com.br" target="_blank" rel="noreferrer" className="no-underline hover:underline">cmmeb.com.br</a></li>
              <li><a href="#local" className="no-underline hover:underline">Salinópolis, PA</a></li>
            </ul>
            <p className="t-small mt-3"><Ph id="contato" /></p>
            <a href="#inscricoes" className="btn btn-sun mt-6">Quero me inscrever <Arrow /></a>
          </div>
          <nav aria-label="Rodapé" className="col-span-12 grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
            <div>
              <h3 className="t-small font-medium text-foam">Congresso</h3>
              <ul className="mt-3 grid gap-2 t-small">
                <li><a href="#sobre">Sobre</a></li><li><a href="#industria">Indústria</a></li><li><a href="#margem">Margem</a></li><li><a href="#ambiente">Ambiente</a></li><li><a href="#eixos">Eixos temáticos</a></li>
              </ul>
            </div>
            <div>
              <h3 className="t-small font-medium text-foam">Participe</h3>
              <ul className="mt-3 grid gap-2 t-small">
                <li><a href="#palestrantes">Palestrantes</a></li><li><a href="#programacao">Programação</a></li><li><a href="#inscricoes">Inscrições</a></li><li><a href="#duvidas">Dúvidas</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h3 className="t-small font-medium text-foam">Fotografias</h3>
              <ul className="mt-3 grid gap-1.5 t-small">
                {credits.map(c => (
                  <li key={c.url}><a href={c.url} target="_blank" rel="noreferrer">{c.what}</a>: {c.author}, {c.licence}</li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <div className="t-small mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 text-foam">
          <span className="max-w-[70ch]">© 2027 II CMMEB · Departamento de Oceanografia e Limnologia, UFMA. Ilustrações e cenas 3D esquemáticas, fora de escala. Costa: Natural Earth; estados: IBGE; bacias sedimentares: ANP.</span>
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
