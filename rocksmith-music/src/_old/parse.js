const axios = require('axios');
const fs = require('fs');
const { URL } = require('url');

// Load cookies from the JSON file
const cookiesFilePath = './cookies.json';
const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf8'));

// Function to format cookies into a string for the Cookie header
function formatCookies(cookies) {
    return cookies
        .map(cookie => `${cookie.name}=${cookie.value}`)
        .join('; ');
}

// Function to visit a single link and get the last URL in the redirect chain
async function getLastRedirect(link, cookieHeader) {
    try {
        let currentUrl = link;
        const visitedUrls = [];

        while (currentUrl) {
            const response = await axios.get(currentUrl, {
                headers: { Cookie: cookieHeader },
                maxRedirects: 0, // Disable automatic redirects
                validateStatus: status => status >= 200 && status < 400,
            });

            visitedUrls.push(currentUrl);
            const redirectUrl = response.headers.location;

            if (redirectUrl) {
                currentUrl = new URL(redirectUrl, currentUrl).toString();
            } else {
                currentUrl = null; // No more redirects
            }
        }

        // Return the last URL in the chain
        return { original: link, final: visitedUrls[visitedUrls.length - 1] };
    } catch (error) {
        console.error(`Error visiting ${link}:`, error.message);
        return { original: link, final: null }; // Return null for errors
    }
}

// Function to process links in batches of 3 concurrent requests
async function getAllRedirects(links, cookieHeader) {
    const redirectMap = {};
    const batchSize = 10; // Number of concurrent requests to process

    for (let i = 0; i < links.length; i += batchSize) {
        // Get the current batch of links
        const currentBatch = links.slice(i, i + batchSize);

        // Create an array of promises for the current batch
        const batchPromises = currentBatch.map(link => getLastRedirect(link, cookieHeader));

        // Wait for the current batch to finish and get the results
        const results = await Promise.all(batchPromises);

        // Store the results in the redirect map
        results.forEach(result => {
            redirectMap[result.original] = result.final;
            console.log(`Processed: ${result.original} -> ${result.final}`);
        });

        // Log progress
        const totalProcessed = Math.min(i + batchSize, links.length);
        const progress = Math.round((totalProcessed / links.length) * 100);
        process.stdout.write(`\rProgress: ${progress}% (${totalProcessed}/${links.length})`);

        // Wait for a delay before processing the next batch (if desired)
        await delay(1000); // 1 second delay between batches
    }

    console.log(); // Move to the next line after progress is done
    return redirectMap;
}

// Function to introduce a delay between requests
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    // Extract links from the file
    const text = fs.readFileSync('songs.txt', 'utf8');
    const links = extractCDLC(text);

    console.log('Extracted links:', links);

    // Format cookies for the request
    const cookieHeader = formatCookies(cookies);

    // Get all redirects with rate limiting (3 at a time)
    const redirectMap = await getAllRedirects(links, cookieHeader);

    console.log('\nRedirect map:', redirectMap);

    // Save the redirect map to a JSON file
    const outputFilePath = './urls.json';
    fs.writeFileSync(outputFilePath, JSON.stringify(redirectMap, null, 2));
    console.log(`Redirect map saved to ${outputFilePath}`);
})();

// Function to extract all "/cdlc/#####" patterns from text
function extractCDLC(text) {
    const regex = /\/cdlc\/\d{5}/g;
    const matches = text.match(regex) || [];
    return matches.map(element =>
        `https://ignition4.customsforge.com/user/collectedcdlcs/toggle/${element.replace('/cdlc/', '')}?platform=pc`
    );
}
