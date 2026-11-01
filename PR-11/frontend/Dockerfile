# =========================================================================
# Practical 11: Frontend Multi-Stage Dockerfile (React + Vite)
# =========================================================================

# Stage 1: Build production assets
FROM node:18-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve the production build using Vite preview on port 5173
EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
