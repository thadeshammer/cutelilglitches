# cute lil glitches

You know how really cool streamers have a cute little animated characters at the bottom of their
overlay, representing their viewers? That's what this is going to be.

GOALS.

- Learn JavaScript. This is my first ever JS project built up from the studs. I did this solo.
- Use Node.js to publish a transparent webpage you can stick into an OBS browser source and Phaser
  for the graphics.
- Make this open source but to also distribute an installer built with Electron for
  folks who aren't tech savy.

## Features

- **Electron**: Cross-platform desktop applications with JavaScript, HTML, and CSS.
- **Node.js**: Backend services and server-side logic.
- **Phaser**: Game development framework for creating 2D games.
- **Passport**: Middleware for authentication in Node.js applications, making it easy to handle
  different authentication methods.
- **Passport-Twitch-New**: A Passport strategy for authenticating with Twitch, allowing seamless
  integration with Twitch's OAuth system. This one seems to be updated and current for now.
- **Helmet**: Middleware for securing Express apps by setting various HTTP headers to help protect
  your app from well-known web vulnerabilities.

## Getting Started

### Prerequisites

Make sure you have the following installed on your development machine:

- [Node.js](https://nodejs.org/) (version 14.x or later)
- [npm](https://www.npmjs.com/) (Node package manager)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root of the project and add your environment variables:

   ```env
   TWITCH_CLIENT_ID=your-twitch-client-id
   TWITCH_CLIENT_SECRET=your-twitch-client-secret
   ```

### Running the Application

To start it up, use `npm start`. Functionality is extremely limited at the time of writing, I'm
very early development. All it does is move ten flowers around at random velocities along the
bottom of the window. Stay tuned for more than that.

Currently this is built for Windows and only tested there. (It turns out the WSL environment
isn't great for X server stuff and Electron HATES it.) I do have Mac hardware I can eventually
test this on.
