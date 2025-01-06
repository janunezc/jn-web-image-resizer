#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1080;

const scanAndResizeImages = async (dir) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recurse into subdirectories
            await scanAndResizeImages(fullPath);
        } else if (/\.(jpe?g|png|webp)$/i.test(file)) {
            try {
                const { width, height } = await sharp(fullPath).metadata();

                if (width > DEFAULT_MAX_WIDTH || height > DEFAULT_MAX_HEIGHT) {
                    console.log(`Resizing: ${fullPath}`);
                    await sharp(fullPath)
                        .resize({
                            width: DEFAULT_MAX_WIDTH,
                            height: DEFAULT_MAX_HEIGHT,
                            fit: 'inside',
                        })
                        .toBuffer()
                        .then((data) => fs.writeFileSync(fullPath, data)); // Overwrite original
                    console.log(`Resized and saved: ${fullPath}`);
                } else {
                    console.log(`Skipping (already optimized): ${fullPath}`);
                }
            } catch (error) {
                console.error(`Error processing file ${fullPath}:`, error.message);
            }
        }
    }
};

(async () => {
    const startDir = process.cwd(); // Use the current directory as the root
    console.log(`Scanning and resizing images in: ${startDir}`);

    try {
        await scanAndResizeImages(startDir);
        console.log('All images processed successfully!');
    } catch (error) {
        console.error('An error occurred:', error.message);
    }
})();
