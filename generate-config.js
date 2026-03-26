#!/usr/bin/env node
/**
 * Generate env-config.js from environment variables
 * This script runs during build to create the config file
 */

const fs = require('fs');
const path = require('path');

// Read the template
const template = fs.readFileSync(path.join(__dirname, 'env-config.template.js'), 'utf8');

// Replace placeholders with environment variables (trim whitespace)
const config = template
  .replace('${VITE_FIREBASE_API_KEY}', (process.env.VITE_FIREBASE_API_KEY || '').trim())
  .replace('${VITE_FIREBASE_AUTH_DOMAIN}', (process.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim())
  .replace('${VITE_FIREBASE_PROJECT_ID}', (process.env.VITE_FIREBASE_PROJECT_ID || '').trim())
  .replace('${VITE_FIREBASE_STORAGE_BUCKET}', (process.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim())
  .replace('${VITE_FIREBASE_MESSAGING_SENDER_ID}', (process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim())
  .replace('${VITE_FIREBASE_APP_ID}', (process.env.VITE_FIREBASE_APP_ID || '').trim())
  .replace('${VITE_FIREBASE_MEASUREMENT_ID}', (process.env.VITE_FIREBASE_MEASUREMENT_ID || '').trim())
  .replace('${VITE_ADMIN_PHONE}', (process.env.VITE_ADMIN_PHONE || '').trim());

// Write the config file
fs.writeFileSync(path.join(__dirname, 'env-config.js'), config);

console.log('✓ Generated env-config.js from environment variables');

// Validate that critical values are present (without exposing them in logs)
const criticalVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
];

let allPresent = true;
criticalVars.forEach(varName => {
  if (!process.env[varName] || process.env[varName].trim() === '') {
    console.error(`✗ Missing or empty environment variable: ${varName}`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('✓ All critical environment variables are present');
} else {
  console.error('✗ Some critical environment variables are missing!');
  process.exit(1);
}
