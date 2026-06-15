import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  CONTENT_SOURCE_DATABASE,
  CONTENT_TARGET_DATABASE,
  verifyContentDatabase,
  verifyManifestSource,
} from './hymn-content.mjs';

verifyManifestSource();
mkdirSync(dirname(CONTENT_TARGET_DATABASE), { recursive: true });
copyFileSync(CONTENT_SOURCE_DATABASE, CONTENT_TARGET_DATABASE);
verifyContentDatabase();

console.log(`Imported verified hymn content to ${CONTENT_TARGET_DATABASE}.`);
