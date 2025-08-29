#!/bin/sh

# Create data directory if it doesn't exist
mkdir -p /app/data

# Try to set permissions, but don't fail if we can't (e.g., with read-only volumes)
if chown -R nextjs:nodejs /app/data 2>/dev/null; then
    echo "Successfully set ownership for /app/data"
else
    echo "Warning: Could not set ownership for /app/data (volume permissions)"
fi

if chmod -R 755 /app/data 2>/dev/null; then
    echo "Successfully set permissions for /app/data"
else
    echo "Warning: Could not set permissions for /app/data (volume permissions)"
fi

# Create database file if it doesn't exist
if [ ! -f /app/data/local.db ]; then
    if touch /app/data/local.db 2>/dev/null; then
        echo "Created database file /app/data/local.db"
        # Try to set ownership and permissions, but don't fail if we can't
        chown nextjs:nodejs /app/data/local.db 2>/dev/null || true
        chmod 644 /app/data/local.db 2>/dev/null || true
    else
        echo "Warning: Could not create database file (volume permissions)"
    fi
else
    echo "Database file already exists"
fi

# Execute the main command
exec "$@"