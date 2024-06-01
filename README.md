# cute lil glitches

You know how really cool streamers have a cute little animated characters at the bottom of their
overlay, representing their viewers? That's what this is going to be.

GOALS.

- Learn JavaScript. This is my first ever JS project built up from the studs. I did this solo.
- Use Node.js to publish a transparent webpage you can stick into an OBS browser source and Phaser
  for the graphics.
- Make this open source but to also distribute an installer built with Electron for
  folks who aren't tech savy.

## Known Issues

| Issue Description                           | Status       |
| ------------------------------------------- | ------------ |
| Twitch Auth works but doesn't persist       | ❌           |
| Twith viewer list load contingent upon auth | ✅           |
| Phaser WebGL warnings in Firefox            | ✅ (wontfix) |
| Unit tests                                  | ❌           |
| Twitch OAuth sans client secret in .env     | ❌           |

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

## Licenses

This project (excluding the art) is licensed under the GNU General Public License v3.0. See the
[LICENSE](LICENSE) file for details.

### Commissioned Art

Some art assets in this project are © [Mouse Draws](https://mousedraws.carrd.co/), used with
permission. All rights are controlled by the project owner.

### Pixel Art License

The pixel art assets included in this project under the /public/assets folder are created by me
(I'm so sorry) and are licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0
International (CC BY-NC-SA 4.0) license.

You are free to:

- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

Under the following terms:

- Attribution — You must give appropriate credit, provide a link to the license, and indicate if
  changes were made. You may do so in any reasonable manner, but not in any way that suggests the
  licensor endorses you or your use.
- NonCommercial — You may not use the material for commercial purposes.
- ShareAlike — If you remix, transform, or build upon the material, you must distribute your
  contributions under the same license as the original.

Full License Text: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)

See the [PIXEL_ART_LICENSE](PIXEL_ART_LICENSE) file for details.

### Usage by the Author

As the original creator, I retain all rights to use, modify, and distribute my work, including for
commercial purposes.
