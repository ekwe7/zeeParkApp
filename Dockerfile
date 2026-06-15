# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port for Expo web
EXPOSE 8081

# Start Expo web server on all interfaces
CMD ["expo", "start", "--web", "--host", "0.0.0.0", "--port", "8081"]
