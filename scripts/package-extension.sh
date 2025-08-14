#!/bin/bash

# Build the extension
echo "Building extension..."
npm run build

# Create a releases directory
mkdir -p releases

# Package the extension
echo "Packaging extension..."
cd dist
zip -r ../releases/currency-arbitrage-extension-v1.0.0.zip ./*
cd ..

echo "✅ Extension packaged at: releases/currency-arbitrage-extension-v1.0.0.zip"
echo "This file can be uploaded to GitHub releases or hosted for download"