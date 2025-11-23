const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const AdmZip = require('adm-zip');

// Function to download the file and save it with retries
async function downloadFile(url, savePath, retries = 3) {
  try {
    // Retry logic
    let attempts = 0;
    while (attempts < retries) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}`);
      }

      // Extract filename from the Content-Disposition header if available
      let filename = path.basename(savePath);
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition && contentDisposition.includes('attachment')) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // If no filename is found, use the last part of the URL
      if (!filename || filename.indexOf('random') !== -1) {
        filename = path.basename(url.split('?')[0]);
      }

      // Save the file as a buffer
      const buffer = await response.buffer();

      // Write the file to disk
      const finalSavePath = path.join(__dirname, "songs", filename);
      fs.writeFileSync(finalSavePath, buffer);
      console.log(`Downloaded: ${finalSavePath}`);
      return finalSavePath;  // Return the saved file path

      attempts++;
    }

    console.log(`Max retries reached for ${url}`);
    return null;  // Return null if retries are exhausted
  } catch (error) {
    console.error(`Error downloading ${url}: ${error.message}`);
    return null;
  }
}

// Function to check if a file is a valid ZIP file
function isZipFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const zipHeader = buffer.slice(0, 4).toString('hex');
  return zipHeader === '504b0304';  // ZIP files start with the hex '504b0304'
}

// Function to extract the zip file with retries
function extractZip(zipPath, extractFolder, retries = 3) {
  let attempts = 0;
  while (attempts < retries) {
    try {
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractFolder, true);
      console.log(`Extracted: ${zipPath} to ${extractFolder}`);
      return;  // Successfully extracted, exit the function
    } catch (error) {
      console.error(`Error extracting ${zipPath}: ${error.message}`);
      attempts++;
    }
  }
  console.log(`Max retries reached for extraction: ${zipPath}`);
}

// Main function to process URLs from the JSON file
async function processUrls(jsonFile) {
  try {
    // Read the JSON file containing URLs
    const urls = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));

    for (let url of Object.values(urls)) {
      // Modify the URL to ensure `dl=1` for direct download
      const modifiedUrl = url.replace('dl=0', 'dl=1');

      // Set the file path for saving the downloaded file (temporary)
      const filename = path.basename(modifiedUrl.split('?')[0]);
      const tempSavePath = path.join(__dirname, "songs", filename);

      // Retry downloading the file
      const downloadedFilePath = await downloadFile(modifiedUrl, tempSavePath);

      if (!downloadedFilePath) {
        continue;  // Skip to the next URL if download failed
      }

      // Retry extraction if the downloaded file is a valid zip
      if (downloadedFilePath.toLowerCase().endsWith('.zip') || isZipFile(downloadedFilePath)) {
        const extractFolder = path.dirname(downloadedFilePath);
        extractZip(downloadedFilePath, extractFolder);

        // Optionally, remove the zip file after extraction
        fs.unlinkSync(downloadedFilePath);
      } else {
        console.log(`Skipped extraction, not a valid zip file: ${downloadedFilePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing URLs from ${jsonFile}: ${error.message}`);
  }
}

// Run the process with the provided JSON file
const jsonFile = 'urls.json';  // Path to the JSON file
processUrls(jsonFile);
