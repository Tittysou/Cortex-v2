const fs = require('fs');

function parseCSV(csvString, delimiter = ',') {
    const [headerLine, ...rows] = csvString.split('\n').filter(Boolean);
    const headers = headerLine.split(delimiter).map(header => header.trim());

    return rows.map(row => {
        const values = row.split(delimiter).map(value => value.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || null;
            return obj;
        }, {});
    });
}

function generateCSV(data, delimiter = ',') {
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header] || '').join(delimiter));
    return [headers.join(delimiter), ...rows].join('\n');
}

function readCSV(filePath, delimiter = ',') {
    const csvString = fs.readFileSync(filePath, 'utf8');
    return parseCSV(csvString, delimiter);
}

function writeCSV(filePath, data, delimiter = ',') {
    const csvString = generateCSV(data, delimiter);
    fs.writeFileSync(filePath, csvString, 'utf8');
}

module.exports = { parseCSV, generateCSV, readCSV, writeCSV };
