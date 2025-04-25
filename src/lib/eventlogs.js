export async function saveLogsToFile(eventInfo) {
    // Join all logs with newlines
    const content = eventInfo;
    try {
        const response = await fetch('http://localhost:3000/save-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({logs: content})
        });
        
        if (response.ok) {
            console.log('Logs saved successfully');
        } else {
            console.error('Error saving logs');
        }
    } catch (error) {
        console.error('Error saving logs', error);
    }
    
}

export async function clearEventLogs(fileName, timestamp) {
    try {
        const response = await fetch('http://localhost:3000/clear-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file: fileName, timestamp: timestamp })
        });
        
        if (response.ok) {
            console.log('Logs cleared successfully');
        } else {
            console.error('Error clearing logs');
        }
    } catch (error) {
        console.error('Error clearing logs', error);
    }
    console.log("Clearing event logs");

}