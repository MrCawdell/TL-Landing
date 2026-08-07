const fs = require('fs')
const { execSync } = require('child_process')
const LANDING = 'C:\\Users\\Danny\\OneDrive\\Desktop\\TL-Landing'

const indexPath = `${LANDING}\\index.html`
let html = fs.readFileSync(indexPath, 'utf8')

// ── 1. Make free text bigger, move directly under h1 ─────────────────────────
// Remove current small free text paragraph
html = html.replace(
  /\s*<p style="margin[^"]*Free to join[^<]*<\/p>/g,
  ''
)

// Add larger free text directly after the h1 closing tag
const h1End = `</h1>`
const freeBlock = `</h1>
      <p style="margin:16px 0 0;font-size:clamp(16px,2vw,20px);color:var(--gold);font-weight:700;line-height:1.4">Free to join. No monthly cost. No signup fee.<br><span style="font-size:0.85em;font-weight:500;opacity:0.85">Pay only when you complete a load — nothing upfront.</span></p>`

// Only replace the first h1 closing tag (in the hero section)
const firstH1 = html.indexOf(h1End)
if (firstH1 === -1) { console.error('ERROR: h1 end tag not found'); process.exit(1) }
html = html.slice(0, firstH1) + freeBlock + html.slice(firstH1 + h1End.length)

// ── 2. Replace "Register Your Interest" button with "Sign Up Free" ─────────────
html = html.replace(
  `<button class="btn-outline" onclick="openModal()">Register Your Interest &rarr;</button>`,
  `<button class="btn-outline" onclick="window.location.href='https://app.tipperlink.com/register'">Sign Up Free &rarr;</button>`
)

if (!html.includes('Sign Up Free')) { console.error('ERROR: CTA not replaced'); process.exit(1) }

fs.writeFileSync(indexPath, html)
console.log('OK free text bigger under h1, CTA changed to Sign Up Free')

execSync('git add index.html', { cwd: LANDING, stdio: 'inherit' })
execSync('git commit -m "feat: bigger free text under hero h1, sign up CTA"', { cwd: LANDING, stdio: 'inherit' })
execSync('git push', { cwd: LANDING, stdio: 'inherit' })
console.log('OK TL-Landing pushed')