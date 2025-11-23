const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Read the JSON file for song data
const songsData = JSON.parse(fs.readFileSync('unique_songs_data.json', 'utf8'));

// Create 'raw' folder if it doesn't exist
const rawFolder = path.join(__dirname, 'raw');
if (!fs.existsSync(rawFolder)) {
  fs.mkdirSync(rawFolder);
}

// Function to download file from a URL
async function downloadFile(url, folder) {
  try {
    const provider = getProvider(url);
    switch (provider) {
      case 'mediafire':
        await downloadFromMediafire(url, folder);
        break;
      case 'googleDrive':
        await downloadFromGoogleDrive(url, folder);
        break;
      case 'dropbox':
        await downloadFromDropbox(url, folder);
        break;
      case 'mega':
        console.log('Mega links are not supported in this version. Skipping...');
        break;
      default:
        console.log(`Skipping unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error downloading file from ${url}: ${error.message}`);
  }
}

// Function to detect the provider based on URL
function getProvider(url) {
  if (url.includes('mediafire.com')) return 'mediafire';
  if (url.includes('drive.google.com')) return 'googleDrive';
  if (url.includes('dropbox.com')) return 'dropbox';
  if (url.includes('mega.nz')) return 'mega';
  return 'unknown';
}

// Download from Mediafire
async function downloadFromMediafire(url, folder) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const fileName = path.basename(url);
  fs.writeFileSync(path.join(folder, fileName), response.data);
  console.log(`Downloaded from Mediafire: ${fileName}`);
}

// Download from Google Drive
async function downloadFromGoogleDrive(url, folder) {
  const fileId = url.split("/d/")[1].split("/")[0];
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  const fileName = `${fileId}.file`;
  fs.writeFileSync(path.join(folder, fileName), response.data);
  console.log(`Downloaded from Google Drive: ${fileName}`);
}

// Download from Dropbox
async function downloadFromDropbox(url, folder) {
  const directUrl = url.replace("?dl=0", "?dl=1");
  const response = await axios.get(directUrl, { responseType: 'arraybuffer' });
  const fileName = path.basename(url);
  fs.writeFileSync(path.join(folder, fileName), response.data);
  console.log(`Downloaded from Dropbox: ${fileName}`);
}

// Loop through songs data and download the files
(async function () {
  for (const song of songsData) {
    if (song.file_pc_link) {
      await downloadFile(song.file_pc_link, rawFolder);
    }
  }
})();
