import type { CSSProperties } from 'react'
import { habitats } from '../data/content'
import { delay } from '../lib/hooks'
import { OrbitMark } from './OrbitMark'
import { ProfileArt } from './ProfileArt'

// recorte do perfil com os corais da plataforma, para o recife que não tem foto
const reefArt = { '--water': '#1b6ba3', '--bed': '#0b2440', '--ink-a': '#0b2440', '--ink-u': '#cdeef5' } as CSSProperties

/** Segunda órbita: o que vive ao redor da operação, cada item com sua relação com a indústria. */
export function Environment() {
  return (
    <section id="ambiente" data-chapter data-bg="#cdeef5" data-ink="#0b2440" className="bg-foam text-ink" aria-labelledby="ambiente-h">
      <div className="wrap py-[clamp(48px,8vw,140px)]">
        <div className="grid12 gap-y-6">
          <div className="col-span-12 flex items-start gap-5 md:col-span-7" data-reveal>
            <OrbitMark active="ambiente" className="mt-1 w-12 text-sea md:w-16" />
            <h2 id="ambiente-h" className="t-head">Em órbita, o ambiente</h2>
          </div>
          <p className="t-lead col-span-12 md:col-span-5 md:self-end" data-reveal style={delay(1)}>
            Ecossistemas e comunidades que convivem com a operação offshore e precisam entrar na mesma conta.
          </p>
        </div>

        <ul className="mt-[clamp(48px,7vw,96px)] grid gap-[clamp(48px,7vw,96px)]">
          {habitats.map((h, i) => (
            <li key={h.name} className="grid12 items-center gap-y-6">
              <figure className={`col-span-12 md:col-span-5 ${i % 2 ? 'md:order-2 md:col-start-8' : ''}`} data-reveal="clip">
                {h.photo ? (
                  <>
                    <div className="overflow-hidden">
                      <img src={h.photo.src} alt={h.photo.alt} width={h.photo.w} height={h.photo.h} loading="lazy" decoding="async" className="breathe aspect-[3/2] w-full object-cover" />
                    </div>
                    <figcaption className="t-small mt-2">{h.photo.caption}</figcaption>
                  </>
                ) : (
                  <>
                    <div className="aspect-[3/2] bg-sea" style={reefArt}>
                      <ProfileArt crop={[1830, 2190, 300, 470]} className="h-full w-full" />
                    </div>
                    <figcaption className="t-small mt-2">Ilustração esquemática de um recife sob a pluma</figcaption>
                  </>
                )}
              </figure>
              <div className={`col-span-12 md:col-span-6 ${i % 2 ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                <h3 className="fs-sub font-black leading-none tracking-[-0.03em]" data-reveal>{h.name}</h3>
                <p className="t-lead mt-4" data-reveal style={delay(1)}>{h.text}</p>
                <p className="t-body mt-5 max-w-[48ch]" data-reveal style={delay(2)}>
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
