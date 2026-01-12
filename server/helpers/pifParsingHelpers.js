const fs = require("fs");
const https = require("https");
const path = require("path")
const {logEvent} = require("./logger");
const parsePIF = require('./parsePIF');

// GitHub API configuration
const GITHUB_API_BASE = 'api.github.com';
const GITHUB_REPO_OWNER = 'CSSPLICE';
const GITHUB_REPO_NAME = 'peml-feasibility-examples';
const GITHUB_BRANCH = 'main';
const GITHUB_DIR_PATH = 'parsons';


const downloadsDir = path.join(__dirname, '../../downloads');


async function downloadFile(filename) {
    logEvent("File download started for: " + filename)
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir);
    }

    const dest = path.join(downloadsDir, filename);


    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(dest);

        const url =
            "https://raw.githubusercontent.com/CSSPLICE/peml-feasibility-examples/refs/heads/main/parsons/"
            + filename
        https.get(url, (response) => {

            if (response.statusCode === 404) {
                console.error(`File '${filename}' not found in GitHub repository`);
                logEvent(`File '${filename}' not found in GitHub repository`);
                response.resume();
                reject(new Error(`File "${filename}" not found in GitHub repository`));
                return;
            }
            
            if (response.statusCode !== 200) {
                console.error(`Failed to get '${url}' (${response.statusCode})`);
                logEvent(`Failed to get '${url}' (${response.statusCode})`)
                response.resume();
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                    logEvent("parse complete")
                    file.close(() => resolve(dest))
                }
            );

            file.on('error', (err) => {
                logEvent("error on parse")
                fs.unlink(dest, () => reject(err));
            });

        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
            console.error(`Error downloading file: ${err.message}`);
        });

    })


}



async function getGitHubFileList() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: GITHUB_API_BASE,
            path: `/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_DIR_PATH}`,
            method: 'GET',
            headers: {
                'User-Agent': 'OpenDSA-Parsons-App',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const files = JSON.parse(data);
                        // Filter for .peml files only
                        const pemlFiles = files
                            .filter(file => file.type === 'file' && file.name.endsWith('.peml'))
                            .map(file => file.name);
                        
                        logEvent(`Retrieved ${pemlFiles.length} .peml files from GitHub`);
                        resolve(pemlFiles);
                    } else {
                        console.error(`GitHub API error: ${res.statusCode} - ${data}`);
                        logEvent(`GitHub API error: ${res.statusCode}`);
                        reject(new Error(`GitHub API error: ${res.statusCode}`));
                    }
                } catch (error) {
                    console.error('Error parsing GitHub API response:', error);
                    logEvent('Error parsing GitHub API response');
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.error('Error fetching GitHub file list:', error);
            logEvent('Error fetching GitHub file list');
            reject(error);
        });

        req.end();
    });
}


async function getUploadedFileList() {
    return new Promise((resolve, reject) => {
        const uploadsDir = path.join(__dirname, '../../uploads');
        
        if (!fs.existsSync(uploadsDir)) {
            resolve([]);
            return;
        }

        fs.readdir(uploadsDir, (err, files) => {
            if (err) {
                console.error('Error reading uploads directory:', err);
                logEvent('Error reading uploads directory');
                reject(err);
                return;
            }

            // Filter for .peml files only
            const pemlFiles = files.filter(file => file.endsWith('.peml'));
            logEvent(`Found ${pemlFiles.length} uploaded .peml files`);
            resolve(pemlFiles);
        });
    });
}


async function getAllAvailableFiles() {
    try {
        const [githubFiles, uploadedFiles] = await Promise.all([
            getGitHubFileList(),
            getUploadedFileList()
        ]);

        return {
            github: githubFiles,
            uploaded: uploadedFiles
        };
    } catch (error) {
        console.error('Error getting all available files:', error);
        logEvent('Error getting all available files');
        // Return empty arrays if there's an error
        return {
            github: [],
            uploaded: []
        };
    }
}

module.exports = {
    parsePIF,
    downloadFile,
    getGitHubFileList,
    getUploadedFileList,
    getAllAvailableFiles
}
