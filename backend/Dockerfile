# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /backend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJs application
RUN npm run build

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/src/main.js"]