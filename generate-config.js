#!/usr/bin/env node
/**
 * Generate env-config.js from environment variables
 * This script runs during build to create the config file
 */

const fs = require('fs');
const path = require('path');

// Read the template
const template = fs.readFileSync(path.join(__dirname, 'env-config.template.js'), 'utf8');

// Replace placeholders with environment variables
const config = template
  .replace('${VITE_FIREBASE_API_KEY}', process.env.VITE_FIREBASE_API_KEY || '')
  .replace('${VITE_FIREBASE_AUTH_DOMAIN}', process.env.VITE_FIREBASE_AUTH_DOMAIN || '')
  .replace('${VITE_FIREBASE_PROJECT_ID}', process.env.VITE_FIREBASE_PROJECT_ID || '')
  .replace('${VITE_FIREBASE_STORAGE_BUCKET}', process.env.VITE_FIREBASE_STORAGE_BUCKET || '')
  .replace('${VITE_FIREBASE_MESSAGING_SENDER_ID}', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
  .replace('${VITE_FIREBASE_APP_ID}', process.env.VITE_FIREBASE_APP_ID || '')
  .replace('${VITE_FIREBASE_MEASUREMENT_ID}', process.env.VITE_FIREBASE_MEASUREMENT_ID || '')
  .replace('${VITE_ADMIN_PHONE}', process.env.VITE_ADMIN_PHONE || '');

// Write the config file
fs.writeFileSync(path.join(__dirname, 'env-config.js'), config);

console.log('✓ Generated env-config.js from environment variables');
