import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { TripReceiptUpload } from '@/features/home-basket/domain/repository';

function buildFallbackFileName(uri: string, mimeType?: string | null) {
  const uriSegments = uri.split('/');
  const uriFileName = uriSegments[uriSegments.length - 1];

  if (uriFileName && uriFileName.includes('.')) {
    return uriFileName;
  }

  switch (mimeType) {
    case 'image/png':
      return `receipt-${Date.now()}.png`;
    case 'image/webp':
      return `receipt-${Date.now()}.webp`;
    default:
      return `receipt-${Date.now()}.jpg`;
  }
}

export async function pickTripReceiptImage(): Promise<TripReceiptUpload | null> {
  if (Platform.OS !== 'web') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      throw new Error('Allow photo library access to attach a receipt image.');
    }
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    allowsEditing: false,
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];

  if (!asset.base64) {
    throw new Error('Home Basket could not read that receipt image. Try a different photo.');
  }

  return {
    base64: asset.base64,
    previewUri: asset.uri,
    fileName: asset.fileName ?? buildFallbackFileName(asset.uri, asset.mimeType),
    mimeType: asset.mimeType ?? 'image/jpeg',
  };
}
