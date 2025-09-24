FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl (for ECS health checks) and any necessary dependencies
RUN apk add --no-cache curl

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 4000

# Start the app
CMD ["node", "index.js"]