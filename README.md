# Speed - Instant Peer-to-Peer File Transfer

**Speed** is a secure, real-time, peer-to-peer (P2P) file transfer application inspired by the convenience of AirDrop. It enables users to transfer files of any size directly between two computers using only a browser and a unique, short-lived room ID, ensuring complete privacy and lightning-fast transfers.

**Note**: Speed currently supports **PC-to-PC** transfers only. Mobile and cross-device functionality is not yet supported. Also, ensure both the sending and recieving computers are on the same WI-FI/network. Cross-network is not supported. 

🔗 **Website link: https://speed-v3.vercel.app**

---

## ✨ Key Features

- **Instant P2P Transfers**: Files are sent directly from one browser to another using WebRTC, bypassing servers for maximum speed and minimal latency.
- **Secure & Private**: End-to-end encrypted connections ensure no files are stored on servers, keeping user data completely private.
- **Multi-File Support**: Select and send multiple files at once, automatically bundled into a single `.zip` archive using JSZip for seamless transfers.
- **Custom Room IDs**: Generates short, memorable, and custom IDs for easy sharing and connection.
- **Responsive UI**: A modern, professional interface built with Radix UI and styled with Tailwind CSS, optimized for both desktop and mobile devices.

---

## 🏛️ Architectural Overview

Speed is built on a decoupled architecture, separating client interaction and peer-to-peer connection brokering for scalability and maintainability.

- **React Frontend (Client)**: A single-page application built with **React** and **TypeScript**, handling file selection, zipping, and WebRTC data connections via the PeerJS client library. Deployed as a static site on **Vercel**.
- **PeerJS Signaling Server (Backend)**: A lightweight **Node.js** and **Express** server running a PeerJS server instance. It acts as a "matchmaker," facilitating the initial WebRTC handshake between clients without handling file data. Deployed on **Render**.
- **WebRTC Data Channel**: Once peers are connected, a direct, encrypted WebRTC data channel handles all file transfers, ensuring speed and privacy.

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally. Ensure you have **Node.js** and **npm** installed.

### 1. Clone the Repository
```bash
git clone https://github.com/Adiii581/speed-v3.git
cd Speed
```

### 2. Run the Backend Server
The signaling server must be running to facilitate WebRTC connections.

```bash
cd server
npm install
npm run dev
```

The server will be available at `http://localhost:4002`.

### 3. Run the Frontend Client
Open a new terminal window to start the client.

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:3000` (or another port if 3000 is in use).

---

## 🛠️ Technology Stack

| **Area**          | **Technologies**                                  |
|-------------------|--------------------------------------------------|
| **Frontend**      | React, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide React, JSZip, PeerJS (client) |
| **Backend**       | Node.js, TypeScript, Express, Peer (PeerJS Server) |
| **P2P Comms**     | WebRTC                                           |

---

## 📚 Why Speed Stands Out

- **Performance**: Leverages WebRTC for direct, low-latency file transfers, avoiding server bottlenecks.
- **Privacy-First**: End-to-end encryption and no server-side storage ensure user data remains secure.
- **User-Friendly**: Intuitive UI with custom room IDs simplifies the file-sharing process.
- **Scalable Design**: Decoupled architecture allows for easy maintenance and future enhancements.

---

## 📬 Contact

For questions, feedback, or contributions, please reach out by connecting with me on [LinkedIn](https://linkedin.com/in/aditya-chhabria123).

---


*Built with 💻 by Aditya Chhabria*







