export const brandPalette = {
  primary: '#A73692',
  primaryPressed: '#842A73',
  primaryContainer: '#F5D9EB',
  accent: '#C1337E',
  lightBackground: '#FFF7FB',
  darkBackground: '#431E38',
  darkSurface: '#6A2B51',
  onPrimary: '#FFFFFF',

  // Accessible brand tint for dark-mode actions: 8.06:1 against darkBackground.
  primaryOnDark: '#F5AED9',
  primaryOnDarkPressed: '#DE8FC0',
  onPrimaryDark: '#431E38',
} as const;

export const neutralPalette = {
  lightSurface: '#FFFFFF',
  lightSurfaceSecondary: '#F8EAF2',
  lightTextPrimary: '#2B1725',
  lightTextSecondary: '#68465B',
  lightTextDisabled: '#987D8E',
  lightBorder: '#D9BFCF',
  lightDivider: '#ECD9E4',
  lightIconPrimary: '#51213E',
  lightIconSecondary: '#765468',
  darkSurfaceSecondary: '#542343',
  darkSurfaceElevated: '#79345F',
  darkTextPrimary: '#FFF7FB',
  darkTextSecondary: '#E8C9DC',
  darkTextDisabled: '#B88FA8',
  darkBorder: '#A9688E',
  darkDivider: '#7D4565',
  darkIconPrimary: '#FFF7FB',
  darkIconSecondary: '#E2B8D2',
} as const;

export const semanticPalette = {
  successLight: '#287A45',
  successDark: '#8ED6A6',
  warningLight: '#865900',
  warningDark: '#F4C978',
  errorLight: '#B3261E',
  errorDark: '#FFB4AB',
  lightOverlay: 'rgba(43, 23, 37, 0.48)',
  darkOverlay: 'rgba(0, 0, 0, 0.64)',
} as const;
