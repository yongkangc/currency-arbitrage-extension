// Simple placeholder icon generator
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];
const iconDir = path.join(__dirname, '../public/icons');

// Create a simple colored square as placeholder
const createPlaceholderIcon = (size) => {
  // Simple base64 encoded 1x1 purple pixel
  const purplePixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  return purplePixel;
};

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

sizes.forEach(size => {
  const filename = path.join(iconDir, `icon-${size}.png`);
  const iconData = createPlaceholderIcon(size);
  fs.writeFileSync(filename, iconData);
  console.log(`Created ${filename}`);
});

console.log('Icon placeholders created successfully!');