const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../server.log');

function logEvent(message) {
    const timestamp = new Date().toISOString();
    const errorTag = message.includes("err") ? "ERROR: " : ""
    const fullMessage = `[${timestamp}] ${errorTag}${message}\n`;
    fs.appendFile(logFilePath, fullMessage, (err) => {
        if (err) console.error("Failed to write to log file:", err);
    });
}

module.exports = {
    logEvent
}
