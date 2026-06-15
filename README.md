# GBCN Hymn App

GBCN Hymn App is an Android-first React Native application built with Expo and
TypeScript. It bundles the validated Yoruba hymn catalogue for complete offline
browsing, reading, and search.

## Prerequisites

- Node.js `^22.13.0`, `^24.3.0`, or `>=25.0.0`
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
npm run content:verify
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
See [Project structure](docs/architecture/project-structure.md#navigation) for
route registration and parameter rules.

## Local Hymn Storage

The application imports `assets/data/gbcn-hymns-1.0.0.db` on first launch using
Expo SQLite and opens it in query-only mode. Startup validates the package
identity, schema version, content version, required tables, and row counts
before rendering the application.

Feature code accesses stored content through the typed `HymnRepository`
interface. `SQLiteHymnRepository` supports ordered hymn/category reads,
retrieval by ID or number, category filtering, and accent-tolerant FTS4 search.

To reproduce the bundled database from the sibling offline content package:

```bash
npm run content:import
```

See the [hymn database schema](docs/content/hymn-database-schema.md) for the
authoritative content model.

During development, open the Expo SQLite inspector by pressing `Shift + M` in
the Expo CLI terminal and selecting **Open expo-sqlite**.
