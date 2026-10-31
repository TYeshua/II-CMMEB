import type { CSSProperties } from 'react'
import { habitats } from '../data/content'
import { delay } from '../lib/hooks'
import { SectionHead } from './Head'
import { ProfileArt } from './ProfileArt'

// recorte do perfil com os corais da plataforma, para o recife que não tem foto
const reefArt = { '--water': '#1b6ba3', '--bed': '#0b2440', '--ink-a': '#0b2440', '--ink-u': '#cdeef5' } as CSSProperties

/** Segunda órbita: o que vive ao redor da operação, cada item com sua relação com a indústria. */
export function Environment() {
  return (
    <section id="ambiente" data-chapter data-bg="#cdeef5" data-ink="#0b2440" className="bg-foam text-ink" aria-labelledby="ambiente-h">
      <div className="wrap sec-pad">
        <SectionHead
          id="ambiente-h"
          mark="ambiente"
          title="Em órbita, o ambiente"
          lead="Ecossistemas e comunidades que convivem com a operação offshore e precisam entrar na mesma conta."
        />

        <ul className="mt-block grid gap-[clamp(40px,5vw,72px)]">
          {habitats.map((h, i) => (
            <li key={h.name} className="grid12 items-center gap-y-5">
              <figure className={`col-span-12 md:col-span-5 ${i % 2 ? 'md:order-2 md:col-start-8' : ''}`} data-reveal="clip">
                {h.photo ? (
                  <>
                    <div className="overflow-hidden rounded-[10px]">
                      <img src={h.photo.src} alt={h.photo.alt} width={h.photo.w} height={h.photo.h} loading="lazy" decoding="async" className="breathe aspect-[3/2] w-full object-cover" />
                    </div>
                    <figcaption className="t-small mt-2 text-deep">{h.photo.caption}</figcaption>
                  </>
                ) : (
                  <>
                    <div className="aspect-[3/2] overflow-hidden rounded-[10px] bg-sea" style={reefArt}>
                      <ProfileArt crop={[1830, 2190, 300, 470]} className="h-full w-full" />
                    </div>
                    <figcaption className="t-small mt-2 text-deep">Ilustração esquemática de um recife sob a pluma</figcaption>
                  </>
                )}
              </figure>
              <div className={`col-span-12 md:col-span-6 ${i % 2 ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                <h3 className="t-sub" data-reveal>{h.name}</h3>
                <p className="t-intro mt-3" data-reveal style={delay(1)}>{h.text}</p>
                <p className="t-body mt-4 max-w-[48ch]" data-reveal style={delay(2)}>
                  <b className="font-black">Com a indústria:</b> {h.link}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
