const fs = require('fs')
const path = require('path')

// Detect which repo we're in
const cwd = process.cwd()
const isTLLanding = cwd.includes('TL-Landing')
const isTipperApp = cwd.includes('tipperlink-app')

console.log('Running from:', cwd)

if (isTLLanding) {
  console.log('Detected: TL-Landing repo')
  
  let html = fs.readFileSync('index.html', 'utf8')
  
  // Fix 1: Reset counter start date so count shows ~110
  const oldDate = `var START_DATE=new Date('2026-04-27').getTime();`
  const newDate = `var START_DATE=new Date('2026-05-20').getTime();`
  html = html.replace(oldDate, newDate)
  
  // Fix 2: Add prominent free messaging in hero
  const oldBadge = `<div class="hero-badge"><span class="dot"></span>Launching 9th June 2026</div>`
  const newBadge = `<div class="hero-badge"><span class="dot"></span>Launching 9th June 2026</div>
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,196,0,0.15);border:1px solid rgba(245,196,0,0.4);border-radius:999px;padding:6px 18px;margin-top:12px;font-size:14px;font-weight:700;color:var(--gold);letter-spacing:0.2px">&#10003; Free to join &mdash; no monthly cost, no signup fee</div>`
  html = html.replace(oldBadge, newBadge)

  if (!html.includes('2026-05-20')) { console.error('ERROR: counter date not updated'); process.exit(1) }
  if (!html.includes('Free to join')) { console.error('ERROR: free pill not added'); process.exit(1) }

  fs.writeFileSync('index.html', html)
  console.log('OK index.html updated — counter reset + free messaging added to hero')

} else if (isTipperApp) {
  console.log('Detected: tipperlink-app repo — no TL-Landing changes to make here')
  console.log('To update the marketing site, cd to TL-Landing first:')
  console.log('  cd C:\\Users\\Danny\\OneDrive\\Desktop\\TL-Landing')
  console.log('  node setup.js')
} else {
  console.error('ERROR: Run this from either tipperlink-app or TL-Landing folder')
  process.exit(1)
}