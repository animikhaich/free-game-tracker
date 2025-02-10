# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY ./package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY ./ .

# Build the Vite application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built assets from the build stage
COPY --from=build /app/dist ./dist

# Install serve to run the application
RUN npm install -g serve

# Expose port 3000
EXPOSE 5173

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"]