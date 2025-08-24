ADMIN_ENV="admin-portal/next.config.ts"
MOBILE_ENV="mobile/.env"
PORT=4000
IP_ADDRESS=$(ifconfig en0 | grep "inet " | grep -Fv 127.0.0.1 | awk '{print $2}')

if [ -e "mobile/.env" ]; then
  echo "Mobile environment file exists."
  ENV_CONTENT=$(cat "$MOBILE_ENV")
  echo "$ENV_CONTENT" | sed -e s/EXPO_PUBLIC_SERVER_IP=.*/EXPO_PUBLIC_SERVER_IP=$IP_ADDRESS/g -e s/EXPO_PUBLIC_SERVER_PORT=.*/EXPO_PUBLIC_SERVER_PORT=4000/g > $MOBILE_ENV
  echo "mobile/.env updated."
else
  echo "Mobile environment file does not exist."
  echo "Creating new environment file in mobile..."
  touch mobile/.env
  echo "EXPO_PUBLIC_SERVER_IP=$IP_ADDRESS\\nEXPO_PUBLIC_SERVER_PORT=4000" > $MOBILE_ENV
  echo "mobile/.env created."
fi

ENV_CONTENT=$(cat "$ADMIN_ENV")
echo "$ENV_CONTENT" | sed -e s/IP_ADDRESS:\ \".*\",/IP_ADDRESS:\ \"$IP_ADDRESS\",/g -e s/PORT:\ \".*\",/PORT:\ \"4000\",/g > $ADMIN_ENV
echo "admin-portal/next.config.ts updated."