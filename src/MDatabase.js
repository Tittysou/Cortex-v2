const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const { mongodb, warn, success } = require('./utils/logs');

const uri = config.mongoDBUrl;
const schemasDir = path.join(__dirname, '../src/schemas');
let client;

async function ensureSchemasFolderExists() {
    if (!fs.existsSync(schemasDir)) {
        fs.mkdirSync(schemasDir, { recursive: true });
        success('Created "schemas" folder in src/');
    } else {
        warn('"schemas" folder already exists in src/');
    }
}

async function connectToDatabase() {
    if (client) return client;

    try {
        if (!uri) {
            warn('No MongoDB URL provided in config file.');
        } else {
            await ensureSchemasFolderExists();

            client = new MongoClient(uri, {});
            await client.connect();

            mongodb('Connected to MongoDB');
            return client;
        }
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

module.exports = connectToDatabase;
