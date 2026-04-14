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

export const HOME_BASKET_SOCIAL_LINKS = [
  {
    label: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61572170822501',
  },
  {
    label: 'TikTok',
    url: 'https://www.tiktok.com/@home_basket_app',
  },
  {
    label: 'X',
    url: 'https://x.com/home_basket_app',
  },
  {
    label: 'Instagram',
    url: 'https://www.instagram.com/home_basket_app/',
  },
] as const;

export function getHomeBasketAbsoluteUrl(path: string) {
  return `${HOME_BASKET_WEBSITE}${path}`;
}
