#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to draw cat with blinking eyes
draw_cat() {
    local blink=$1
    if [ "$blink" = "true" ]; then
        echo -e "${CYAN}  /\\___/\\"
        echo -e " (  - -  )"
        echo -e " (  =^=  )"
        echo -e "  (____)${NC}"
    else
        echo -e "${CYAN}  /\\___/\\"
        echo -e " (  o o  )"
        echo -e " (  =^=  )"
        echo -e "  (____)${NC}"
    fi
}

# Clear screen
clear

# Print header and cat
echo -e "${BLUE}========================================="
echo -e "    ${YELLOW}Nori Playlist Fetcher${BLUE}"
echo -e "=========================================${NC}"
echo
draw_cat false
echo
echo -e "${GREEN}-----------------------------------------"
echo -e "Enter playlist URL:"
echo -e "-----------------------------------------${NC}"

# Prompt for playlist URL
read -p "> " playlist_url

# Check if URL was provided
if [ -z "$playlist_url" ]; then
    echo -e "${RED}Error: No URL provided${NC}"
    exit 1
fi

# Print separator for log output
echo
echo -e "${GREEN}-----------------------------------------"
echo -e "Log Output:"
echo -e "-----------------------------------------${NC}"

# Install dependencies
cd src && npm install

# Run the fetch command
cd src && npm run fetch "$playlist_url"

# Copy song links to clipboard
if [ -f "song_links.txt" ]; then
    echo
    echo -e "${GREEN}-----------------------------------------"
    echo -e "${YELLOW}Copying song links to clipboard...${NC}"
    cat song_links.txt | xclip -selection clipboard
    echo -e "${GREEN}Done! Links are now in your clipboard.${NC}"
else
    echo -e "${RED}Warning: song_links.txt not found${NC}"
fi

# Final cat blink
sleep 0.5
draw_cat true
sleep 0.2
draw_cat false
