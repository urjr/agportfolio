const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const images = [
  'google.webp',
  'upenn.jpg',
  'notarize.webp',
  'adhawk.webp',
  'smarking.webp'
];

const workDir = '/Users/ulisesreyes/websites/agportfolio/public/assets/work';
const scratchDir = '/Users/ulisesreyes/websites/agportfolio/scratch';

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

images.forEach(img => {
  const inputPath = path.join(workDir, img);
  const outputPath = path.join(scratchDir, `${img}.bmp`);
  
  try {
    // Convert to a 1x1 BMP
    execSync(`sips -s format bmp -z 1 1 "${inputPath}" --out "${outputPath}"`, { stdio: 'ignore' });
    
    // Read the BMP file
    const buffer = fs.readFileSync(outputPath);
    
    // In a 24-bit or 32-bit BMP, the pixel data starts at the offset specified at byte 10 (4 bytes)
    const pixelOffset = buffer.readUInt32LE(10);
    const bpp = buffer.readUInt16LE(28); // bits per pixel
    
    let hexColor = '';
    if (bpp === 24) {
      const b = buffer[pixelOffset];
      const g = buffer[pixelOffset + 1];
      const r = buffer[pixelOffset + 2];
      hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } else if (bpp === 32) {
      const b = buffer[pixelOffset];
      const g = buffer[pixelOffset + 1];
      const r = buffer[pixelOffset + 2];
      const a = buffer[pixelOffset + 3];
      hexColor = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
    } else {
      hexColor = `Unknown BPP: ${bpp}`;
    }
    
    console.log(`${img}: ${hexColor} (BPP: ${bpp})`);
    
    // Let's also get the actual edge/corner pixel by cropping to 1x1 from the top-left (0, 0)
    const cornerOutputPath = path.join(scratchDir, `${img}_corner.bmp`);
    // Crop to 1x1 from top-left offset. 
    // sips -c 1 1 crops around the center by default, so we use cropOffset 0 0
    execSync(`sips -s format bmp -c 1 1 --cropOffset 0 0 "${inputPath}" --out "${cornerOutputPath}"`, { stdio: 'ignore' });
    const cornerBuffer = fs.readFileSync(cornerOutputPath);
    const cornerPixelOffset = cornerBuffer.readUInt32LE(10);
    const cornerBpp = cornerBuffer.readUInt16LE(28);
    let cornerHexColor = '';
    if (cornerBpp === 24) {
      const b = cornerBuffer[cornerPixelOffset];
      const g = cornerBuffer[cornerPixelOffset + 1];
      const r = cornerBuffer[cornerPixelOffset + 2];
      cornerHexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    } else if (cornerBpp === 32) {
      const b = cornerBuffer[cornerPixelOffset];
      const g = cornerBuffer[cornerPixelOffset + 1];
      const r = cornerBuffer[cornerPixelOffset + 2];
      const a = cornerBuffer[cornerPixelOffset + 3];
      cornerHexColor = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
    }
    console.log(`  Corner pixel color: ${cornerHexColor}`);
  } catch (err) {
    console.error(`Error processing ${img}:`, err.message);
  }
});
