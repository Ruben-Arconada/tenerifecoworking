import sharp from 'sharp';

const W = 1200, H = 630;
// Fondo amarillo de marca + texto. El logo (cuadrado amarillo con bombilla)
// se funde con el fondo, así que lo montamos con esquinas redondeadas y sombra simulada.
const bg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbbf2d"/>
      <stop offset="1" stop-color="#f0a915"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="600" y="475" font-family="Helvetica, Arial, sans-serif" font-size="56" font-weight="800" fill="#1a1611" text-anchor="middle">Alquiler de espacios en Canarias</text>
  <text x="600" y="540" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="500" fill="#44230a" text-anchor="middle">tenerifecoworking.es</text>
</svg>`;

const logo = await sharp('public/logo.png')
  .resize(280, 280)
  .composite([{
    input: Buffer.from(`<svg width="280" height="280"><rect width="280" height="280" rx="40" fill="black"/></svg>`),
    blend: 'dest-in',
  }])
  .png()
  .toBuffer();

await sharp(Buffer.from(bg))
  .composite([{ input: logo, left: 460, top: 70 }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-default.png');

console.log('og-default.png generado');
