const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${size}x${size} icon`);
  }
  
  // Generate notification icon (smaller)
  await sharp(svgPath)
    .resize(96, 96)
    .png()
    .toFile(path.join(__dirname, 'public', 'notification-icon.png'));
  
  console.log('✓ Generated notification-icon.png');
  
  // Generate badge icon
  await sharp(svgPath)
    .resize(72, 72)
    .png()
    .toFile(path.join(__dirname, 'public', 'badge-icon.png'));
  
  console.log('✓ Generated badge-icon.png');
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
