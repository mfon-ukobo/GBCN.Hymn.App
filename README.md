# GBCN Hymn App

GBCN Hymn App is an Android-first React Native application built with Expo and
TypeScript. This project currently provides only the application foundation and
placeholder feature screens.

Production hymn content, preferences, themes, and final branding are not
implemented yet.

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

## Architecture

The application uses a feature-first source structure. Application source code
is located under `src/`, and source imports may use the `@/` alias.

Create new product features under `src/features/`. See
[Project structure](docs/architecture/project-structure.md) for module
responsibilities, dependency rules, and naming conventions.

## Navigation

The application uses React Navigation with a native root stack and bottom tabs.
The main tabs are Hymns, Search, Favourites, and Settings. Root stack routes are
`MainTabs`, `Categories`, `CategoryHymns`, and `HymnDetail`.

Navigation configuration and route types are located in `src/navigation/`.
Current feature screens are placeholders for verifying the navigation
foundation. See [Project structure](docs/architecture/project-structure.md#navigation)
for route registration and parameter rules.

## Local Hymn Storage

The Android application uses `expo-sqlite` for persistent offline hymn storage.
Startup enables SQLite foreign keys, applies pending versioned migrations, and
then renders the application. Initialization errors are surfaced and never
trigger destructive database recreation.

Feature code accesses stored content through the typed `HymnRepository`
interface. `SQLiteHymnRepository` supports ordered hymn/category reads,
retrieval by ID or number, category filtering, and atomic catalogue
replacement. Development builds load `assets/data/hymns.sample.json` only when
the database has no hymns; it is not the production catalogue.

During development, open the Expo SQLite inspector by pressing `Shift + M` in
the Expo CLI terminal and selecting **Open expo-sqlite**.
