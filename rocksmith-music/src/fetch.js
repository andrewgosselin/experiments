const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");

// Spotify Credentials
const clientId = '01c3d3d417ad402d8d0ef9958d14f6c7';
const clientSecret = '0c8dfc9c260143a8b3b33af8abb32379';

// Spotify API URL for Authentication
const authUrl = 'https://accounts.spotify.com/api/token';

// Global array to store all unique data
let allUniqueData = [];

// Function to get Spotify access token
async function getSpotifyToken() {
    const response = await axios.post(authUrl, new URLSearchParams({
        'grant_type': 'client_credentials',
    }), {
        headers: {
            'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`,
        },
    });

    return response.data.access_token;
}

// Function to get artists from a playlist
async function getArtistsFromPlaylist(playlistUrl, token) {
    const playlistId = playlistUrl.split('/').pop().split('?')[0];
    const playlistUrlApi = `https://api.spotify.com/v1/playlists/${playlistId}`;

    const response = await axios.get(playlistUrlApi, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    const artists = new Set();
    response.data.tracks.items.forEach(item => {
        item.track.artists.forEach(artist => {
            artists.add(artist.name);
        });
    });

    return [...artists]; // Return unique artists
}
function cleanArtistName(artist) {
    return artist
        .toLowerCase()
        .replace(/&amp;/g, 'and')
        .replace(/&/g, 'and') 
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

// Function to execute the cURL command
function executeCurlCommand(artist) {
    return new Promise((resolve, reject) => {
        fs.readFile("updated_curl", "utf8", (err, curlCommand) => {
            if (err) {
                console.error("Error reading file:", err);
                reject(err);
                return;
            }

            // Replace single quotes with double quotes for Windows compatibility
            let updatedCurlCommand = curlCommand.replace(/'/g, '"');
            updatedCurlCommand = updatedCurlCommand.replace("ARTIST_NAME_PLACEHOLDER", encodeURIComponent(artist))
                .replace("curl \"", "curl -s \"")
                .replace("length=10", "length=99");

            exec(updatedCurlCommand, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr) {
                    reject(new Error(stderr));
                    return;
                }

                try {
                    const jsonData = JSON.parse(stdout);
                    const uniqueData = [];
                    const seenTitles = new Set();
                    const currentArtist = artist;

                    jsonData.data.forEach(item => {
                        if (!seenTitles.has(item.title) && item.downloads > 10) {
                            if (cleanArtistName(item.artist.name) === cleanArtistName(currentArtist)) {
                                uniqueData.push({
                                    title: item.title,
                                    album: item.album,
                                    artist: artist,
                                    file_pc_link: item.file_pc_link
                                });
                                seenTitles.add(item.title);
                            }
                        }
                    });

                    console.log(`Fetched ${uniqueData.length} unique songs for artist: ${artist}`);

                    // Add the uniqueData from this run to the global array
                    allUniqueData = allUniqueData.concat(uniqueData);
                    resolve();
                } catch (parseError) {
                    console.error("Error parsing JSON:", parseError);
                    reject(parseError);
                }
            });
        });
    });
}

// Function to write all unique data to a JSON file
function writeDataToFile() {
    return new Promise((resolve, reject) => {
        const limited = allUniqueData.map(song => song.file_pc_link);
        const text = limited.join("\n");
        fs.writeFile("song_links.txt", text, (err) => {
            if (err) {
                console.error("Error writing to file:", err);
                reject(err);
                return;
            }
            console.log("Song links have been saved to song_links.txt");
            resolve();
        });
    });
}

// Main function to handle the entire flow
async function processPlaylist(playlistUrl) {
    try {
        const token = await getSpotifyToken();
        const artists = await getArtistsFromPlaylist(playlistUrl, token);

        // Process each artist and wait for all to complete
        await Promise.all(artists.map(artist => executeCurlCommand(artist)));
        
        // Write data immediately after all commands are done
        await writeDataToFile();

    } catch (error) {
        console.error("Error processing playlist:", error);
    }
}
const args = process.argv.slice(2); // Get arguments starting from index 2
console.log(`Received argument: ${args[0]}`);

// Call the main function with a Spotify playlist URL
const playlistUrl = args[0]; // Replace with the actual playlist URL
processPlaylist(playlistUrl);
