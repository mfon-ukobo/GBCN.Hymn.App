# Canonical Hymn JSON Format

GBCN hymn content uses one canonical application-level structure. Content
conversion and import tooling must produce this format rather than database
records or a second hymn model.

## Catalogue

A catalogue contains category records and hymn records:

```json
{
  "categories": [
    { "id": "praise", "name": "Praise", "sortOrder": 1 }
  ],
  "hymns": [
    {
      "id": "hymn-001",
      "number": 1,
      "title": "Example Hymn",
      "categoryIds": ["praise"],
      "sections": [
        {
          "type": "verse",
          "order": 1,
          "number": 1,
          "label": "Verse 1",
          "lines": ["First lyric line", "Second lyric line"]
        },
        {
          "type": "chorus",
          "order": 2,
          "label": "Chorus",
          "lines": ["Chorus lyric line"]
        }
      ]
    }
  ]
}
```

## Records

`HymnCategory` fields:

- `id`: required stable, unique, non-empty string without surrounding whitespace.
- `name`: required non-empty string. Validation trims surrounding whitespace.
- `sortOrder`: optional finite number used to control display order.

`Hymn` fields:

- `id`: required stable, unique, non-empty string without surrounding whitespace.
- `number`: required unique positive integer.
- `title`: required non-empty string. Validation trims surrounding whitespace.
- `categoryIds`: required array of unique known category identifiers; it may be empty.
- `sections`: required non-empty array of hymn sections.

`HymnSection` fields:

- `type`: required `verse` or `chorus`.
- `order`: required positive integer, unique within its hymn.
- `number`: required positive integer for verses; optional positive integer for choruses.
- `label`: optional display string.
- `lines`: required lyric-line array containing at least one non-empty line.

## Validation And Ordering

Runtime validation rejects missing fields, unexpected fields, unsupported
section types, duplicate identifiers or order values, and unknown category
references. It returns a normalized copy of the catalogue:

- categories and hymns retain their input order;
- hymn sections are sorted by ascending `order`;
- leading and trailing whitespace-only lyric lines are removed;
- lyric line content and intentional blank lines inside a section are preserved.

Use `validateCatalogue` before importing catalogue JSON. Application code must
use the exported canonical hymn types and must not expose SQLite row shapes as
domain records.
