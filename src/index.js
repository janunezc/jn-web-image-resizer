#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const yargs = require('yargs');

const argv = yargs
  .option('dir', {
    alias: 'd',
    description: 'Directory to scan',
    type: 'string',
    default: process.cwd(),
  })
  .option('maxWidth', {
    alias: 'w',
    description: 'Maximum width of images',
    type: 'number',
    default: 1920,
  })
  .option('maxHeight', {
    alias: 'h',
    description: 'Maximum height of images',
    type: 'number',
    default: 1080,
  })
  .help()
  .alias('help', 'h')
  .argv;

const scanAndResizeImages = async (dir, maxWidth, maxHeight) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      await scanAndResizeImages(fullPath, maxWidth, maxHeight);
    } else if (/\.(jpe?g|png|webp)$/i.test(file)) {
      const { width, height } = await sharp(fullPath).metadata();

      if (width > maxWidth || height > maxHeight) {
        console.log(`Resizing: ${fullPath}`);
        const resizedPath = path.join(
          dir,
          `resized-${path.basename(file)}`
        );
        await sharp(fullPath)
          .resize({ width: maxWidth, height: maxHeight, fit: 'inside' })
          .toFile(resizedPath);
        console.log(`Saved: ${resizedPath}`);
      }
    }
  }
};

(async () => {
  try {
    await scanAndResizeImages(argv.dir, argv.maxWidth, argv.maxHeight);
    console.log('Image resizing completed!');
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
