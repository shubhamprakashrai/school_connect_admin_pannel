/** Notification / FCM DTOs */

export type DeviceType = 'ANDROID' | 'IOS' | 'WEB';

export interface RegisterFcmTokenRequest {
  token: string;
  deviceType: DeviceType;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
}
