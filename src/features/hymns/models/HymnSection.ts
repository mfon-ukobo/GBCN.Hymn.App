export enum HymnSectionType {
  Verse = 'verse',
  Chorus = 'chorus',
}

export interface HymnSection {
  type: HymnSectionType;
  order: number;
  number?: number;
  label?: string;
  lines: string[];
}
