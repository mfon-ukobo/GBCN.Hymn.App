import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

describe('application themes', () => {
  it('provide complete matching token structures', () => {
    expect(Object.keys(lightTheme).sort()).toEqual(Object.keys(darkTheme).sort());
    expect(Object.keys(lightTheme.colors).sort()).toEqual(Object.keys(darkTheme.colors).sort());
    expect(Object.keys(lightTheme.typography).sort()).toEqual(Object.keys(darkTheme.typography).sort());
    expect(Object.keys(lightTheme.spacing).sort()).toEqual(Object.keys(darkTheme.spacing).sort());
    expect(Object.keys(lightTheme.radii).sort()).toEqual(Object.keys(darkTheme.radii).sort());
    expect(Object.keys(lightTheme.sizing).sort()).toEqual(Object.keys(darkTheme.sizing).sort());
  });

  it('provides every required semantic color token', () => {
    expect(Object.keys(lightTheme.colors).sort()).toEqual(
      [
        'background',
        'border',
        'divider',
        'error',
        'iconPrimary',
        'iconSecondary',
        'onPrimary',
        'overlay',
        'primary',
        'primaryContainer',
        'primaryPressed',
        'statusBar',
        'success',
        'surface',
        'surfaceElevated',
        'surfaceSecondary',
        'textDisabled',
        'textInverse',
        'textPrimary',
        'textSecondary',
        'warning',
      ].sort(),
    );
  });

  it('provides every required typography, spacing, radius, and sizing token', () => {
    expect(Object.keys(lightTheme.typography).sort()).toEqual(
      [
        'bodyLarge',
        'bodyMedium',
        'bodySmall',
        'caption',
        'display',
        'headingLarge',
        'headingMedium',
        'headingSmall',
        'labelLarge',
        'labelMedium',
      ].sort(),
    );
    expect(Object.keys(lightTheme.spacing).sort()).toEqual(
      ['lg', 'md', 'none', 'sm', 'xl', 'xs', 'xxl', 'xxs'].sort(),
    );
    expect(Object.keys(lightTheme.radii).sort()).toEqual(
      ['full', 'large', 'medium', 'none', 'small'].sort(),
    );
    expect(Object.keys(lightTheme.sizing).sort()).toEqual(
      [
        'controlHeight',
        'iconLarge',
        'iconMedium',
        'iconSmall',
        'screenHorizontalPadding',
        'touchTargetMinimum',
      ].sort(),
    );
  });
});
