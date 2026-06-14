# Project Structure

GBCN Hymn App uses a feature-first source structure. Application composition,
product features, shared code, and infrastructure implementations have explicit
boundaries so future work can be added without reorganising the project.

## Source Tree

```text
.
├── docs/
│   └── architecture/
│       └── project-structure.md
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── index.ts
│   ├── components/
│   ├── features/
│   │   ├── categories/
│   │   ├── favourites/
│   │   ├── hymns/
│   │   ├── search/
│   │   └── settings/
│   ├── hooks/
│   ├── infrastructure/
│   │   ├── database/
│   │   └── preferences/
│   ├── navigation/
│   ├── theme/
│   ├── types/
│   └── utils/
├── tests/
├── app.json
├── index.ts
├── jest.config.js
├── package.json
└── tsconfig.json
```

Empty reserved directories contain `.gitkeep`. Remove the file when real files
are added to the directory.

## Directory Responsibilities

- `src/app` contains application-level composition, including the root
  component, application-wide providers, dependency composition, global error
  boundaries, and startup coordination. It must not contain feature-specific
  screens or business rules.
- `src/components` contains UI components genuinely shared across multiple
  features. Components used by only one feature belong inside that feature.
- `src/features` contains product functionality grouped by feature.
- `src/hooks` contains hooks shared by multiple features. Feature-specific
  hooks belong inside their feature.
- `src/infrastructure` contains implementations that interact with device
  services, persistence systems, or external technical systems.
- `src/infrastructure/database` is reserved for local hymn storage.
- `src/infrastructure/preferences` is reserved for preference persistence.
- `src/navigation` is reserved for route definitions, navigation containers,
  route types, and navigation utilities.
- `src/theme` is reserved for colours, spacing, typography, and theme
  definitions.
- `src/types` contains types shared across multiple features.
- `src/utils` contains small, pure utilities shared across multiple features.
  These utilities must not depend on React components or device APIs.
- `tests` contains application-level integration tests. Tests should otherwise
  be placed close to the code they test where practical.

Do not place code in a shared directory merely because its long-term owner is
uncertain. Keep code in its feature until multiple features genuinely share it.

## Feature Modules

A feature owns its screens, components, hooks, services, types, and utilities.
Create only the child directories the feature currently requires. A mature
feature may use this structure:

```text
feature-name/
├── components/
├── hooks/
├── screens/
├── services/
├── types/
├── utils/
└── index.ts
```

Use `index.ts` only to define a deliberate public module API. Avoid direct
feature-to-feature dependencies. When one feature must expose functionality to
another, export it through its `index.ts` and import from the public API.

```ts
import { Hymn } from '@/features/hymns';
```

Do not deep-import feature internals:

```ts
import { Hymn } from '@/features/hymns/types/Hymn';
```

## Dependency Direction

- `src/app` may import from components, features, hooks, infrastructure,
  navigation, theme, types, and utilities.
- A feature may import its own files and shared components, hooks,
  infrastructure, theme, types, and utilities.
- A feature must not import from `src/app`.
- Shared components, hooks, theme, types, and utilities must not import from
  product features or `src/app`.
- Infrastructure must not import React Native UI components, feature screens,
  or `src/app`. It may use shared types and utilities.
- Avoid feature-to-feature imports. When required, import only through the
  feature's public API.

## Import Alias

Application code under `src/` may use `@/` as an alias for the `src/`
directory:

```ts
import App from '@/app';
import { Hymn } from '@/features/hymns';
```

The root Expo entry file is outside `src/` and may use a relative import.
TypeScript, Metro, and Jest are configured to resolve the alias.

## Navigation

`src/navigation/AppNavigator.tsx` owns the application's single
`NavigationContainer`. Do not nest another navigation container in a navigator,
screen, or feature.

The root native stack owns application-level routes and default platform back
behaviour. The bottom-tab navigator owns the four persistent main sections:

```text
RootStack
├── MainTabs
│   ├── HymnsTab
│   ├── SearchTab
│   ├── FavouritesTab
│   └── SettingsTab
├── Categories
├── CategoryHymns
└── HymnDetail
```

Register main-section routes in `MainTabNavigator.tsx` and application-level
routes in `RootStackNavigator.tsx`. Define every route and its parameters in
`types.ts`. Route parameters must contain stable, serializable identifiers
rather than complete domain objects, database entities, large collections,
functions, or React components.

Navigation imports feature screens only through each feature's public
`index.ts`. Features must expose screens needed by navigation through that
public API instead of allowing deep imports into their internal `screens`
directories.

## Naming Conventions

- Directories use lowercase names, such as `features`, `favourites`, and
  `navigation`.
- React component filenames use PascalCase, such as `HymnList.tsx`.
- Hook filenames start with `use`, such as `useHymns.ts`.
- Utility filenames use camelCase, such as `normaliseText.ts`.
- Types use descriptive PascalCase names and do not use an `I` prefix.
- Tests use `ComponentName.test.tsx` or `utilityName.test.ts`.
- Use `index.ts` for deliberate module APIs only. Do not create a global barrel
  that re-exports the entire application.

## Adding A Feature

Create a lowercase directory under `src/features/` and add only the
subdirectories needed by its initial implementation:

```text
src/features/example/
├── components/
├── screens/
├── types/
└── index.ts
```

Keep feature-specific code inside the feature. Export only the API other
modules need through the feature's `index.ts`, and do not deep-import its
internal files.
