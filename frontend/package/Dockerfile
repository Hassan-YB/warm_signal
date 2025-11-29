# Use Node 20 as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose Next.js port
EXPOSE 3000

# Set environment variable for Next.js
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Start the development server with hot-reload
CMD ["npm", "run", "dev"]

