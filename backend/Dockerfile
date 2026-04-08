# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /

ARG DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cardly
ENV DATABASE_URL=${DATABASE_URL}

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm ci
# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN npx prisma generate

# Build the NestJs application
RUN npm run build

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
