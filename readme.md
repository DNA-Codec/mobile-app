# Noodles Mobile App

This is the mobile application for the Noodles DNA data storage system. It allows users to upload files, view encoded data, and manage their DNA storage directly from their mobile devices.

## Installation

This app requires ionic to be installed. You can install it globally using npm:

```bash
npm install -g @ionic/cli
```

To run a dev-mode web version of the app, follow these steps:

1. Clone the repository
2. Install dependencies using `npm install`
3. Run the application using `ionic serve` (development mode)

To use it on Android Studio, run:

1. `ionic build --prod`
2. `ionic cap add android`
3. `ionic cap open android`

## Configuration

All configuration can be done through environment variables. Refer to the `.env.example` file for a list of available configuration options.
