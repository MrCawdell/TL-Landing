const fs = require('fs')
let html = fs.readFileSync('index.html', 'utf8')

// Fix 1: Reset counter start date to recent and lower base
// Change START_DATE so counter shows ~110 not 269
const oldDate = `var START_DATE=new Date('2026-04-27').getTime();`
const newDate = `var START_DATE=new Date('2026-05-20').getTime();`
html = html.replace(oldDate, newDate)

// Fix 2: Add "free to join" pill in hero, right after the hero-badge
const oldBadge = `<div class="hero-badge"><span class="dot"></span>Launching 9th June 2026</div>`
const newBadge = `<div class="hero-badge"><span class="dot"></span>Launching 9th June 2026</div>
      <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,196,0,0.12);border:1px solid rgba(245,196,0,0.3);border-radius:999px;padding:4px 14px;margin-top:10px;margin-bottom:4px;font-size:13px;font-weight:700;color:var(--gold)">Free to join &mdash; no monthly cost, no signup fee</div>`

html = html.replace(oldBadge, newBadge)

if (!html.includes('2026-05-20')) { console.error('ERROR: date not replaced'); process.exit(1) }
if (!html.includes('Free to join')) { console.error('ERROR: free pill not added'); process.exit(1) }

fs.writeFileSync('index.html', html)
console.log('OK counter reset, free pill added to hero')