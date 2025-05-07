const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Configuration
const outputDir = path.join(__dirname, 'public', 'direction');
const outputFile = path.join(outputDir, 'one_shot_clock.png');

// Parameters (same semantics as in React component)
const grayHours = [8, 11];  // Gray ticks at hours
const bodyHour = 6;         // Body hand hour
const arrowHour = 3;        // Arrow hand hour
const size = 600;           // Canvas width and height in px
const lengthRatio = 0.8;    // Length of hands relative to radius
const lineWidthGray = 12;   // Gray tick thickness
const lineWidth = 15;       // Body & arrow thickness
const headLength = 0.1;     // Arrow head length (fraction of radius)
const headWidth = 0.1;      // Arrow head width (fraction of radius)

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Create canvas and context
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Translate to center and set caps
const radius = size / 2;
ctx.translate(radius, radius);
ctx.lineCap = 'round';

// Draw gray ticks
ctx.strokeStyle = 'gray';
ctx.lineWidth = lineWidthGray;
grayHours.forEach(h => {
  const angle = (90 - h * 30) * Math.PI / 180;
  const dx = Math.cos(angle) * radius * lengthRatio;
  const dy = Math.sin(angle) * radius * lengthRatio;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(dx, dy);
  ctx.stroke();
});

// Draw body hand (solid line)
ctx.strokeStyle = 'red';
ctx.lineWidth = lineWidth;
{
  const angle = (90 - bodyHour * 30) * Math.PI / 180;
  const dx = Math.cos(angle) * radius * lengthRatio;
  const dy = Math.sin(angle) * radius * lengthRatio;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(dx, dy);
  ctx.stroke();
}

// Draw arrow hand
{
  const angle = (90 - arrowHour * 30) * Math.PI / 180;
  const dx = Math.cos(angle) * radius * lengthRatio;
  const dy = Math.sin(angle) * radius * lengthRatio;

  // Draw shaft
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(dx, dy);
  ctx.stroke();

  // Draw arrowhead
  const headLen = headLength * radius;
  const headWid = headWidth * radius;
  // Compute base of head
  const baseX = dx - Math.cos(angle) * headLen;
  const baseY = dy - Math.sin(angle) * headLen;
  // Perpendicular vector for width
  const perpX = Math.cos(angle + Math.PI/2) * headWid;
  const perpY = Math.sin(angle + Math.PI/2) * headWid;

  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.moveTo(dx, dy);
  ctx.lineTo(baseX + perpX, baseY + perpY);
  ctx.lineTo(baseX - perpX, baseY - perpY);
  ctx.closePath();
  ctx.fill();
}

// Save to file
const out = fs.createWriteStream(outputFile);
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => console.log(`Saved clock image to ${outputFile}`));
