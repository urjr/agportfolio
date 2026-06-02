const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inputPath = '/Users/ulisesreyes/websites/agportfolio/public/assets/work/smarking.webp';
const outputPath = '/Users/ulisesreyes/websites/agportfolio/scratch/smarking_full.bmp';

try {
  // Convert smarking.webp to full-size BMP
  execSync(`sips -s format bmp "${inputPath}" --out "${outputPath}"`, { stdio: 'ignore' });
  
  const buffer = fs.readFileSync(outputPath);
  const pixelOffset = buffer.readUInt32LE(10);
  const width = buffer.readUInt32LE(18);
  const height = Math.abs(buffer.readInt32LE(22));
  const bpp = buffer.readUInt16LE(28);
  
  console.log(`Image size: ${width}x${height}, BPP: ${bpp}`);
  
  const rowSize = Math.ceil((width * (bpp / 8)) / 4) * 4;
  const bytesPerPixel = bpp / 8;
  
  function getPixelColor(x, y) {
    // Top-to-bottom layouts do not need row reversing
    const actualY = y;
    const offset = pixelOffset + (actualY * rowSize) + (x * bytesPerPixel);
    const b = buffer[offset];
    const g = buffer[offset + 1];
    const r = buffer[offset + 2];
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  // Let's print colors at some coordinate grid on the edges
  const points = [
    [10, 10], [50, 10], [100, 10],
    [10, 50], [10, 100], [10, 200],
    [5, 5], [2, 2], [1, 1], [0, 0]
  ];
  
  points.forEach(([x, y]) => {
    console.log(`Pixel (${x}, ${y}): ${getPixelColor(x, y)}`);
  });
  
} catch (err) {
  console.error('Error:', err);
}
