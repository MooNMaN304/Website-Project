# --- Builder Stage ---
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app
# Copy dependency files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

# Copy project files (exclude node_modules to avoid conflicts)
COPY app ./app
COPY components ./components
COPY fonts ./fonts
COPY lib ./lib
COPY public ./public
COPY next.config.mjs next.config.ts tsconfig.json postcss.config.mjs middleware.ts ./
COPY *.md ./

# --- Runner Stage ---
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files from builder
COPY --from=builder /app /app

# Debug: List files to verify
RUN ls -la /app

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000

    # Expose port
EXPOSE 3000

    # Run dev server
CMD ["pnpm", "dev"]


