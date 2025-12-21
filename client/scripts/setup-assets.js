const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple icon (48x48)
const iconSvg = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="48" rx="12" fill="#4F46E5"/>
<path d="M24 16C19.6 16 16 19.6 16 24C16 28.4 19.6 32 24 32C28.4 32 32 28.4 32 24C32 19.6 28.4 16 24 16ZM24 28C21.8 28 20 26.2 20 24C20 21.8 21.8 20 24 20C26.2 20 28 21.8 28 24C28 26.2 26.2 28 24 28Z" fill="white"/>
</svg>`;

// Create a simple splash screen (1242x2436)
const splashSvg = `<svg width="1242" height="2436" viewBox="0 0 1242 2436" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="1242" height="2436" fill="#4F46E5"/>
<circle cx="621" cy="1218" r="200" fill="white"/>
</svg>`;

// Create a simple favicon (32x32)
const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="32" height="32" rx="8" fill="#4F46E5"/>
<circle cx="16" cy="16" r="8" fill="white"/>
</svg>`;

// Save SVG files
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSvg);
fs.writeFileSync(path.join(assetsDir, 'favicon.svg'), faviconSvg);

console.log('SVG assets created successfully!');

// Install required packages if not already installed
try {
  // Convert SVG to PNG using sharp
  console.log('Installing sharp for image processing...');
  execSync('npm install --save-dev sharp', { stdio: 'inherit' });
  
  // Convert SVGs to PNGs
  const sharp = require('sharp');
  
  console.log('Converting SVGs to PNGs...');
  
  // Convert icon
  await sharp(path.join(assetsDir, 'icon.svg'))
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
    
  // Convert splash
  await sharp(path.join(assetsDir, 'splash.svg'))
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
    
  // Convert favicon
  await sharp(path.join(assetsDir, 'favicon.svg'))
    .png()
    .toFile(path.join(assetsDir, 'favicon.png'));
    
  // Create adaptive icon for Android
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 79, g: 70, b: 229, alpha: 1 }
    }
  })
  .composite([
    {
      input: Buffer.from(
        `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="256" cy="256" r="160" fill="white"/>
        </svg>`
      ),
      gravity: 'center'
    }
  ])
  .png()
  .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  
  console.log('All assets created successfully!');
  
} catch (error) {
  console.warn('Could not convert SVGs to PNGs. Make sure to install sharp manually:');
  console.warn('npm install --save-dev sharp');
  console.warn('Then run this script again.');
}
