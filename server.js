const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/save-logs', (req, res) => {
    const logs = req.body.logs;
    const dirPath = path.join(__dirname, 'events/problem1/dummyUser');
    const filePath = path.join(dirPath, 'event_logs.txt');
    
    // Ensure the directory exists
    fs.mkdirSync(dirPath, { recursive: true });
    
    fs.appendFile(filePath, logs + '\n', (err) => {
        if (err) {
            return res.status(500).send('Error saving logs');
        }
        res.send('Logs saved successfully');
    });
});

app.post('/clear-logs', (req, res) => {
    const dirPath = path.join(__dirname, 'events/problem1/dummyUser');
    const filePath = path.join(dirPath, 'event_logs.txt');
    
    // Ensure the directory exists
    fs.mkdirSync(dirPath, { recursive: true });
    
    fs.writeFile(filePath, '', (err) => {
        if (err) {
            return res.status(500).send('Error clearing logs');
        }
        res.send('Logs cleared successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});