#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetSize = 1024 * 1024 * 2; // Images larger than 2MB will be resized
const maxDimension = 1920; // Maximum width or height of the image

// Function to scan directory recursively and process images
function scanDirectory(directory) {
    console.log("Scanning Directory...", directory);
    fs.readdir(directory, {withFileTypes: true}, (err, entries) => {
        if (err) {
            console.error('Error reading directory:', directory, err);
            return;
        }

        entries.forEach(entry => {
            const fullPath = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                scanDirectory(fullPath);
            } else if (isImageFile(entry.name)) {
                console.log("Processing image...", fullPath);
                processImage(fullPath);
            }
        });
    });
}

// Check if the file is an image
function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Process an image: check its size and compress if necessary
function processImage(filePath) {
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.error('Error accessing file:', filePath, err);
            return;
        }

        if (stats.size > targetSize) {
            compressImage(filePath);
        } else {
            console.log('No compression needed:', filePath);
        }
    });
}

// Compress the image using Sharp
function compressImage(filePath) {
    sharp(filePath)
            .resize({width: maxDimension, height: maxDimension, fit: 'inside'})
            .toBuffer()
            .then(data => {
                fs.writeFile(filePath, data, err => {
                    if (err) {
                        console.error('Error writing file:', filePath, err);
                    } else {
                        console.log('Compressed and saved:', filePath);
                    }
                });
            })
            .catch(err => {
                console.error('Error processing image:', filePath, err);
            });
}

// Start scanning from the current directory
scanDirectory(process.cwd());
