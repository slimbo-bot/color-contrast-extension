const sharp = require('sharp');
const fs = require('fs');

// Create simple SVG icon
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="url(#grad)"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="30" fill="#fff" opacity="0.9"/>
  <circle cx="55" cy="55" r="12" fill="#000"/>
  <circle cx="73" cy="55" r="12" fill="#000"/>
  <text x="64" y="90" font-size="24" text-anchor="middle" fill="#000" font-weight="bold">Aa</text>
</svg>
`;

// Save SVG
fs.writeFileSync('icon.svg', svg);

// Create PNG versions
const sizes = [16, 48, 128];
sizes.forEach(size => {
  sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(\`icon\${size}.png\`)
    .then(() => console.log(\`Created icon\${size}.png\`))
    .catch(err => console.error(err));
});
