# Use the official Playwright image as base
FROM mcr.microsoft.com/playwright:v1.58.2-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Install browsers
RUN npx playwright install

# Create test results directory
RUN mkdir -p test-results playwright-report

# Run health check
RUN npm run health:check

# Default command
CMD ["npm", "test"]