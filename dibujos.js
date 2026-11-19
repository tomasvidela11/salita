// Ilustraciones propias en SVG (logo y actividades de ejemplo, sin fotos de internet).

const aImagen = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

const CASITA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfeffc"/><stop offset="1" stop-color="#94d5f5"/></linearGradient></defs>
<rect width="512" height="512" rx="112" fill="url(#f)"/>
<rect x="148" y="238" width="216" height="172" rx="22" fill="#fff"/>
<polygon points="256,114 404,250 108,250" fill="#f7a1a1" stroke="#f7a1a1" stroke-width="28" stroke-linejoin="round"/>
<circle cx="256" cy="202" r="28" fill="#fff"/><circle cx="256" cy="202" r="17" fill="#8fd3f4"/>
<path d="M222 410V338a34 34 0 0 1 68 0v72z" fill="#ffd56b"/>
</svg>`;

export const CASITA = aImagen(CASITA_SVG);

const TITERES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
<rect width="400" height="250" fill="#ffe4ec"/>
<path d="M0 0H400V34Q375 60 350 34Q325 60 300 34Q275 60 250 34Q225 60 200 34Q175 60 150 34Q125 60 100 34Q75 60 50 34Q25 60 0 34Z" fill="#f7a1a1"/>
<rect y="204" width="400" height="46" fill="#f3c98b"/><rect y="198" width="400" height="8" fill="#e5b06a"/>
<circle cx="40" cy="90" r="5" fill="#ffd56b"/><circle cx="360" cy="80" r="6" fill="#8fd3f4"/><circle cx="345" cy="150" r="4" fill="#b9a8f0"/><circle cx="55" cy="160" r="5" fill="#7ccf95"/>
<rect x="92" y="72" width="96" height="178" rx="48" fill="#8fd3f4"/>
<rect x="92" y="206" width="96" height="12" fill="#fff" opacity=".85"/><rect x="92" y="228" width="96" height="12" fill="#fff" opacity=".85"/>
<path d="M108 82q7-28 15 0q7-28 15 0q7-28 15 0q7-28 15 0" fill="none" stroke="#ffd56b" stroke-width="8" stroke-linecap="round"/>
<circle cx="122" cy="114" r="14" fill="#fff"/><circle cx="158" cy="114" r="14" fill="#fff"/>
<circle cx="125" cy="117" r="6.5" fill="#22405c"/><circle cx="155" cy="117" r="6.5" fill="#22405c"/>
<circle cx="140" cy="136" r="8" fill="#f7a1a1"/>
<path d="M116 152Q140 180 164 152Z" fill="#c0506f"/>
<rect x="214" y="90" width="96" height="160" rx="48" fill="#ffd56b"/>
<rect x="214" y="206" width="96" height="12" fill="#f7a1a1" opacity=".8"/><rect x="214" y="228" width="96" height="12" fill="#f7a1a1" opacity=".8"/>
<path d="M230 100l10-24l10 24l10-24l10 24l10-24l10 24l10-24" fill="none" stroke="#7ccf95" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="246" cy="130" r="13" fill="#fff"/><circle cx="280" cy="130" r="13" fill="#fff"/>
<circle cx="250" cy="128" r="6" fill="#22405c"/><circle cx="284" cy="128" r="6" fill="#22405c"/>
<circle cx="236" cy="152" r="7" fill="#f7a1a1" opacity=".7"/><circle cx="290" cy="152" r="7" fill="#f7a1a1" opacity=".7"/>
<path d="M248 158Q263 172 278 158" fill="none" stroke="#c0506f" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const COLLAGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
<rect width="400" height="250" fill="#fff5d9"/>
<rect y="200" width="400" height="50" fill="#c5ecce"/>
<circle cx="330" cy="62" r="42" fill="none" stroke="#ffd56b" stroke-width="7" stroke-dasharray="7 11" stroke-linecap="round"/>
<circle cx="330" cy="62" r="28" fill="#ffd56b"/>
<g opacity=".18" transform="translate(5 5)"><rect x="120" y="110" width="120" height="92"/><polygon points="106,114 180,52 254,114"/><polygon points="299,96 336,162 262,162"/></g>
<rect x="120" y="110" width="120" height="92" fill="#8fd3f4"/>
<polygon points="106,114 180,52 254,114" fill="#f7a1a1"/>
<rect x="166" y="150" width="30" height="52" rx="2" fill="#ffd56b"/>
<rect x="132" y="126" width="24" height="24" fill="#fff"/>
<circle cx="218" cy="138" r="13" fill="#fff"/>
<rect x="292" y="150" width="14" height="52" fill="#c99a6b"/>
<polygon points="299,96 336,162 262,162" fill="#7ccf95"/>
<circle cx="52" cy="58" r="15" fill="#b9a8f0"/>
<rect x="38" y="112" width="28" height="28" fill="#f7a1a1" transform="rotate(15 52 126)"/>
<polygon points="66,168 90,202 42,202" fill="#8fd3f4"/>
<circle cx="96" cy="88" r="8" fill="#ffd56b"/>
<rect x="250" y="20" width="18" height="18" fill="#7ccf95" transform="rotate(-12 259 29)"/>
</svg>`;

const MURAL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
<rect width="400" height="250" fill="#eaf6fd"/>
<rect x="30" y="20" width="340" height="210" rx="6" fill="#fff"/>
<rect x="40" y="30" width="156" height="92" fill="#fff0b3"/><rect x="204" y="30" width="156" height="92" fill="#ffdcc2"/>
<rect x="40" y="128" width="156" height="92" fill="#dbe9ff"/><rect x="204" y="128" width="156" height="92" fill="#d6f3d9"/>
<circle cx="118" cy="76" r="32" fill="none" stroke="#ffc94a" stroke-width="6" stroke-dasharray="6 9" stroke-linecap="round"/>
<circle cx="118" cy="76" r="21" fill="#ffc94a"/>
<path d="M262 50c30 0 36 30 18 48c-18 0-30-18-18-48z" fill="#f0a35e"/><path d="M262 50l18 48" stroke="#c0651b" stroke-width="3"/>
<path d="M310 64c26 4 28 30 12 42c-16-2-24-20-12-42z" fill="#e5794a"/><path d="M310 64l12 42" stroke="#a9532a" stroke-width="3"/>
<g fill="#fff"><circle cx="96" cy="152" r="16"/><circle cx="118" cy="146" r="20"/><circle cx="140" cy="154" r="15"/><rect x="88" y="152" width="58" height="16" rx="8"/></g>
<g stroke="#8fb6f0" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 8"><path d="M98 176v34"/><path d="M118 176v34"/><path d="M138 176v34"/></g>
<g transform="translate(282 170)"><path d="M0 4v40" stroke="#5fb877" stroke-width="5" stroke-linecap="round"/>
<g fill="#f7a1a1"><circle cx="0" cy="-14" r="11"/><circle cx="13" cy="-4" r="11"/><circle cx="8" cy="11" r="11"/><circle cx="-8" cy="11" r="11"/><circle cx="-13" cy="-4" r="11"/></g>
<circle r="8" fill="#ffd56b"/></g>
<rect x="16" y="12" width="46" height="16" fill="#ffd56b" opacity=".8" transform="rotate(-24 39 20)"/>
<rect x="338" y="12" width="46" height="16" fill="#8fd3f4" opacity=".8" transform="rotate(24 361 20)"/>
<rect x="16" y="222" width="46" height="16" fill="#f7a1a1" opacity=".8" transform="rotate(24 39 230)"/>
<rect x="338" y="222" width="46" height="16" fill="#7ccf95" opacity=".8" transform="rotate(-24 361 230)"/>
</svg>`;

const GENERICA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
<rect width="400" height="250" fill="#e6f6fd"/>
<path d="M200 46c72 0 122 40 122 86c0 30-30 36-52 26c-18-8-30 8-22 26s-10 26-36 26c-72 0-124-36-124-82s46-82 112-82z" fill="#fff"/>
<circle cx="146" cy="104" r="17" fill="#f7a1a1"/><circle cx="198" cy="84" r="17" fill="#ffd56b"/>
<circle cx="250" cy="98" r="17" fill="#8fd3f4"/><circle cx="134" cy="152" r="17" fill="#7ccf95"/><circle cx="184" cy="178" r="15" fill="#b9a8f0"/>
<g transform="rotate(32 300 120)"><rect x="292" y="40" width="16" height="104" rx="8" fill="#c99a6b"/><rect x="290" y="140" width="20" height="16" fill="#cfd8df"/><path d="M290 156h20l-4 30q-6 8-12 0z" fill="#f0a35e"/></g>
</svg>`;

const ILUSTRACIONES = { titeres: TITERES, collage: COLLAGE, mural: MURAL, generica: GENERICA };
const cache = {};
export const dibujo = clave => (cache[clave] ||= aImagen(ILUSTRACIONES[clave] || GENERICA));
