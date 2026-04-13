export const HOME_BASKET_SUPPORT_EMAIL = 'gabriel@transcripe.com';
export const HOME_BASKET_WEBSITE = 'https://homebasketapp.com';

export const HOME_BASKET_ROUTES = {
  about: '/about',
  privacy: '/privacy',
  terms: '/terms',
  support: '/support',
  deleteAccount: '/delete-account',
  android: '/download-android',
  ios: '/download-ios',
} as const;

export function getHomeBasketAbsoluteUrl(path: string) {
  return `${HOME_BASKET_WEBSITE}${path}`;
}
