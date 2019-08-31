# Linked type of app where you can create profiles, follow people and update your account and status.
Watch a video of this project:
https://drive.google.com/file/d/1TODVaoQ8RrmzL6BCd0oPpEHQ2EZDeRMP/view

> Small social network app built with the MERN stack.

## Quick Start

```bash
# Install dependencies for server
npm install

# Install dependencies for client
npm run client-install

# Run the client & server with concurrently
npm run dev

# Run the Express server only
npm run server

# Run the React client only
npm run client

# Server runs on http://localhost:5000 and client on http://localhost:3000
```

You will need to create a keys_dev.js in the server config folder with

```
module.exports = {
  mongoURI: 'YOUR_OWN_MONGO_URI',
  secretOrKey: 'YOUR_OWN_SECRET'
};
```
