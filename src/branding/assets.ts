import type { ImageSourcePropType } from 'react-native';

export type BrandingAppearance = 'light' | 'dark';

const fullColourCrest = require('../../assets/branding/gbcn-logo.png') as ImageSourcePropType;

export const brandingAssets = {
  logoLight: fullColourCrest,
  logoDark: fullColourCrest,
} as const;

export function getBrandingLogo(appearance: BrandingAppearance): ImageSourcePropType {
  return appearance === 'dark' ? brandingAssets.logoDark : brandingAssets.logoLight;
}
