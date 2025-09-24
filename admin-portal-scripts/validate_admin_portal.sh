#!/bin/bash
set -e

echo "Validating Admin Portal is up (pinging '/')..."

URL="http://localhost:3000/"
MAX_RETRIES=5
SLEEP_TIME=5

for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i: Checking $URL"
    
    # Ping root and check for HTTP 200 response
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "Admin Portal is up! Received HTTP 200 OK."
        exit 0
    else
        echo "Received HTTP $HTTP_STATUS. Retrying in $SLEEP_TIME seconds..."
        sleep $SLEEP_TIME
    fi
done

echo "Admin Portal failed to respond with 200 OK after $MAX_RETRIES attempts."
exit 1
