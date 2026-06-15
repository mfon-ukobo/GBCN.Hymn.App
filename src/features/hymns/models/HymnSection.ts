export enum HymnSectionType {
  Verse = 'verse',
  Chorus = 'chorus',
  Refrain = 'refrain',
  Other = 'other',
}

export interface HymnSection {
  type: HymnSectionType;
  order: number;
  number?: number;
  label?: string;
  lines: string[];
}
