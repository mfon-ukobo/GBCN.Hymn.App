# GBCN Hymn App

GBCN Hymn App is an Android-first React Native application built with Expo and
TypeScript. This project currently provides only the application foundation and
a minimal placeholder screen.

Hymn features, navigation, storage, preferences, themes, and final branding are
not implemented yet.

## Prerequisites

- Node.js `^20.19.4`, `^22.13.0`, `^24.3.0`, or `>=25.0.0`
- npm
- One of the following for Android execution:
  - An Android emulator
  - A physical Android device running Expo Go
  - A locally generated Expo development build when introduced later

## Install

```bash
npm install
```

## Run

Start the Expo development server:

```bash
npm run start
```

Open the application on a connected Android emulator or device:

```bash
npm run android
```

## Verify

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npx expo-doctor
```
