import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const webosDir = path.join(root, 'webos');

if (!fs.existsSync(distDir)) {
  console.error('Cartella dist non trovata. Esegui prima npm run build.');
  process.exit(1);
}

fs.rmSync(webosDir, { recursive: true, force: true });
fs.mkdirSync(webosDir, { recursive: true });

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
    return;
  }
  fs.copyFileSync(src, dest);
}

for (const item of fs.readdirSync(distDir)) {
  copyRecursive(path.join(distDir, item), path.join(webosDir, item));
}

const appInfo = {
  id: 'com.aura.tv',
  version: '1.0.0',
  vendor: 'AURA',
  type: 'web',
  main: 'index.html',
  title: 'AURA TV',
  icon: 'icon.png',
  largeIcon: 'largeIcon.png',
  appDescription: 'AURA TV test build for LG webOS',
  resolution: '1920x1080',
  bgColor: '#050711',
  iconColor: '#050711',
  requiredPermissions: [
    'internet'
  ],
  trustLevel: 'default'
};

fs.writeFileSync(path.join(webosDir, 'appinfo.json'), JSON.stringify(appInfo, null, 2) + '\n');

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
  <rect width="80" height="80" rx="18" fill="#050711"/>
  <circle cx="40" cy="40" r="30" fill="#101a3d"/>
  <text x="40" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#ffffff">A</text>
</svg>`;

const largeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="130" height="130" viewBox="0 0 130 130">
  <rect width="130" height="130" rx="28" fill="#050711"/>
  <circle cx="65" cy="65" r="48" fill="#101a3d"/>
  <text x="65" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#ffffff">A</text>
</svg>`;

fs.writeFileSync(path.join(webosDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(webosDir, 'largeIcon.svg'), largeIconSvg);

// webOS accetta meglio PNG per icon/largeIcon, ma SVG resta incluso.
// Creiamo placeholder PNG-like filename copiando SVG se non sono disponibili tool grafici.
fs.copyFileSync(path.join(webosDir, 'icon.svg'), path.join(webosDir, 'icon.png'));
fs.copyFileSync(path.join(webosDir, 'largeIcon.svg'), path.join(webosDir, 'largeIcon.png'));

console.log('webOS build pronta in ./webos');
console.log('Ora puoi eseguire: ares-package webos');
