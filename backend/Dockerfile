# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJs application
RUN npm run build

# Expose the application port
EXPOSE 3001

# Command to run the application
CMD ["sh", "-c", "npx prisma generate && node dist/src/main.js"]
