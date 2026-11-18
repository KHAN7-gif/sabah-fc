// Tab Studio: galeri jersi gaya "ruang ganti" (jersi digantung).
// Warna dan maklumat di bawah ialah CONTOH. Kemaskini mengikut kit rasmi sebelum diterbitkan.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const studioKits = [
  {
    id: 'kandang',
    label: 'Kit Kandang',
    season: '2026/27',
    body: '#111111',
    trim: '#f2c230',
    text: '#f2c230',
    number: '1',
    note: 'Warna contoh. Sahkan dengan kit rasmi.'
  },
  {
    id: 'tandang',
    label: 'Kit Tandang',
    season: '2026/27',
    body: '#f4f4f1',
    trim: '#111111',
    text: '#111111',
    number: '2',
    note: 'Warna contoh. Sahkan dengan kit rasmi.'
  },
  {
    id: 'third-1963',
    label: 'Kit Third "1963"',
    season: '2026/27',
    body: '#1d4f3c',
    trim: '#e8d9a8',
    text: '#e8d9a8',
    number: '63',
    note: 'Edisi 1963 bersama PMC dan Lotto. Warna contoh.'
  }
];

const shirtSvg = (k) => `
<svg class="studio-shirt-svg" viewBox="0 0 200 220" aria-hidden="true">
  <path d="M62 14 L40 26 L8 52 L32 96 L52 86 L52 210 L148 210 L148 86 L168 96 L192 52 L160 26 L138 14 Q100 36 62 14 Z"
        fill="${esc(k.body)}" stroke="${esc(k.trim)}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M62 14 Q100 36 138 14" fill="none" stroke="${esc(k.trim)}" stroke-width="6"/>
  <text x="100" y="128" text-anchor="middle" font-size="58" font-weight="800"
        font-family="Arial, sans-serif" fill="${esc(k.text)}">${esc(k.number)}</text>
</svg>`;

export const studioView = () => `
<section class="studio">
  <div class="studio-heading">
    <span>Studio</span>
    <h2>Galeri Jersi</h2>
    <p class="notice">Tribute tidak rasmi peminat. Tiada hubungan rasmi dengan Sabah FC.</p>
  </div>
  <div class="studio-rail" role="list">
    ${studioKits.map(k => `
    <article class="studio-hanger" role="listitem">
      <div class="studio-hook" aria-hidden="true"></div>
      <div class="studio-shirt">${shirtSvg(k)}</div>
      <div class="studio-info">
        <strong>${esc(k.label)}</strong>
        <small>${esc(k.season)}</small>
        <p>${esc(k.note)}</p>
      </div>
    </article>`).join('')}
  </div>
</section>`;
