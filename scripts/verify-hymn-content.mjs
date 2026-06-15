import { CONTENT_TARGET_DATABASE, verifyContentDatabase } from './hymn-content.mjs';

verifyContentDatabase();
console.log(`Verified bundled hymn content at ${CONTENT_TARGET_DATABASE}.`);
