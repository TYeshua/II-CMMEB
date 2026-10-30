// Publica o build no GitHub Pages: gera dist/ e o envia, como um commit único, para a branch gh-pages.
import { execSync } from 'node:child_process'
import { rmSync } from 'node:fs'

const REMOTE = 'https://github.com/TYeshua/II-CMMEB.git'
const run = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit' })

run('npm run build')
rmSync('dist/.git', { recursive: true, force: true })
run('git init -q -b gh-pages', 'dist')
run('git add -A', 'dist')
run(`git commit -q -m "Publica o site (${new Date().toISOString().slice(0, 16).replace('T', ' ')})"`, 'dist')
run(`git push -f ${REMOTE} gh-pages`, 'dist')
rmSync('dist/.git', { recursive: true, force: true })
console.log('\nPublicado: https://tyeshua.github.io/II-CMMEB/')
