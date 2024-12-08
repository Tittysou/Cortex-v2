function extractURLs(text) {
    const urlRegex = /https?:\/\/[^\s/$.?#].[^\s]*/g;
    return text.match(urlRegex) || [];
}

function validateRegex(text, regex) {
    return regex.test(text);
}

function extractEmails(text) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return text.match(emailRegex) || [];
}

module.exports = { extractURLs, validateRegex, extractEmails };
