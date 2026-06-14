import appConfig from '../../app.json';

import { appBranding } from './branding';
import { brandPalette } from './brandPalette';
import { brandingAssets, getBrandingLogo } from './assets';

describe('application branding', () => {
  it('exposes the approved application name', () => {
    expect(appBranding.appName).toBe(appConfig.expo.name);
  });

  it('resolves the supplied crest for supported appearances', () => {
    expect(brandingAssets.logoLight).toBeDefined();
    expect(brandingAssets.logoDark).toBeDefined();
    expect(getBrandingLogo('light')).toBe(brandingAssets.logoLight);
    expect(getBrandingLogo('dark')).toBe(brandingAssets.logoDark);
  });

  it('keeps native branding configuration aligned with the central palette', () => {
    expect(appConfig.expo.primaryColor).toBe(brandPalette.primary);
    expect(appConfig.expo.backgroundColor).toBe(brandPalette.lightBackground);
    expect(appConfig.expo.android.adaptiveIcon.backgroundColor).toBe(brandPalette.primary);
    expect(appConfig.expo.plugins).toContainEqual([
      'expo-splash-screen',
      expect.objectContaining({
        backgroundColor: brandPalette.lightBackground,
        dark: expect.objectContaining({
          backgroundColor: brandPalette.darkBackground,
        }),
      }),
    ]);
  });
});
