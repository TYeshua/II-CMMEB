import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Transect } from './components/Transect'
import { Basins } from './components/Basins'
import { Axes } from './components/Axes'
import { Environment } from './components/Environment'
import { Speakers } from './components/Speakers'
import { Program } from './components/Program'
import { Registration } from './components/Registration'
import { Place } from './components/Place'
import { Organizers } from './components/Organizers'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { useEffect } from 'react'
import { useRevealAll } from './lib/hooks'

export default function App() {
  useRevealAll()
  // cada bloco vira um card de vidro na sua própria cor
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-chapter]').forEach(el => {
      if (el.dataset.bg && el.dataset.bg !== 'transparent') el.style.setProperty('--glass', el.dataset.bg)
    })
  }, [])

  return (
    <>
      <a href="#sobre" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-sun focus:px-4 focus:py-2 focus:text-ink">Pular para o conteúdo</a>
      <Header />
      <main>
        <Hero />
        <About />
        <Basins />
        <Transect />
        <Environment />
        <Axes />
        <Speakers />
        <Program />
        <Registration />
        <Place />
        <Organizers />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
