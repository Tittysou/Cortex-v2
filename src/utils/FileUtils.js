const fs = require('fs').promises;

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data); 
  } catch (error) {
    console.error('Error reading JSON file:', error);
    throw error;
  }
}

async function writeJSON(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing JSON file:', error);
    throw error;
  }
}

module.exports = { readJSON, writeJSON };
