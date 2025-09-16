// server/src/server.ts
import express from 'express';
import { createServer } from 'http';
import { ExpressPeerServer } from 'peer';

const app = express();
const server = createServer(app);

// This is the important part for Render.
// It uses the PORT from the environment, or defaults to 4002 for local testing.
const PORT = parseInt(process.env.PORT || '4002');

const peerServer = ExpressPeerServer(server, {
    path: '/myapp' // This path matches the client configuration
});

// Mounts the PeerJS server on the Express app
app.use('/', peerServer);

server.listen(PORT, () => {
    console.log(`🚀 PeerJS signaling server running on port ${PORT}`);
});
