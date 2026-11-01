# =========================================================================
# Practical 11: Backend Dockerfile (Node.js & Express API)
# =========================================================================

FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifests first for optimal layer caching
COPY package*.json ./

# Install project dependencies inside clean container environment
RUN npm install --omit=dev

# Copy all application source code
COPY . .

# Expose backend API port
EXPOSE 5000

# Default command to run backend server
CMD ["node", "server.js"]
