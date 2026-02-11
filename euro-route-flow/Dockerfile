# Build stage
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Clean npm cache and install dependencies
RUN npm cache clean --force && \
    npm ci --prefer-offline --no-audit --legacy-peer-deps

# Copy source code
COPY . .

# Build the application with environment variables
# Use localhost:8081 for browser access (external port mapping from docker-compose)
ARG VITE_API_URL=http://localhost:8081/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Runtime stage
FROM node:18-slim

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
