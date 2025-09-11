Speed - Instant Peer-to-Peer File Transfer
Speed is a secure, real-time, peer-to-peer (P2P) file transfer application inspired by the convenience of AirDrop. It allows users to transfer files of any size directly between two devices using only a browser and a unique, short-lived room ID, ensuring complete privacy and speed.

[Live Demo Link Here] (e.g., https://speed-app.vercel.app)

✨ Key Features
Instant P2P Transfers: Files are sent directly from one browser to another using WebRTC, bypassing the server for maximum speed and minimal latency.

Secure & Private: The connection is end-to-end encrypted, and no files are ever stored on a server, ensuring user data remains completely private.

Multi-File Support: Users can select and send multiple files at once, which are automatically bundled into a single .zip archive on the sender's browser using JSZip for a convenient transfer.

Custom Room IDs: Generates a short, memorable, and custom ID for each user to easily share and connect.

Responsive UI: A modern, professional interface built with a component library based on Radix UI and styled with Tailwind CSS, providing a seamless experience on both desktop and mobile devices.

🏛️ Architectural Overview
Speed operates on a decoupled architecture, separating the concerns of client interaction and peer-to-peer connection brokering.

React Frontend (Client): The user interface is a single-page application built with React and TypeScript. It handles file selection, zipping, and manages the WebRTC data connection via the peerjs client library. It is deployed as a static site on Vercel.

PeerJS Signaling Server (Backend): A lightweight Node.js and Express server acts as the "matchmaker." Its sole purpose is to run a PeerJS server instance (from the peer library), which manages user IDs and facilitates the initial WebRTC handshake between two clients. It does not handle any file data. This server is deployed on Render.

WebRTC Data Channel: Once the signaling server introduces two peers, a direct, encrypted WebRTC data channel is established between them. All file data is then transferred through this channel, ensuring speed and privacy.

🚀 Getting Started
To run this project locally, you will need to have Node.js and npm installed.

1. Clone the Repository
git clone [https://github.com/YourUsername/speed-project.git](https://github.com/YourUsername/speed-project.git)
cd speed-project

2. Run the Backend Server
The signaling server must be running for the frontend to connect.

cd server
npm install
npm run dev

The server will be running on http://localhost:4002.

3. Run the Frontend Client
Open a new terminal window to run the client.

cd client
npm install
npm run dev

The application will be available at http://localhost:5173 (or another port if 5173 is in use).

🛠️ Technology Stack
Area

Technologies

Frontend

React, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide React, JSZip, PeerJS (client)

Backend

Node.js, TypeScript, Express, Peer (PeerJS Server)

P2P Comms

WebRTC

Deployment

Vercel (Frontend), Render (Backend)

This project showcases a modern, full-stack approach to solving a real-world problem with a focus on performance, security, and user experience.