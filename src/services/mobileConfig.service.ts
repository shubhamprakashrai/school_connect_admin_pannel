/** Mobile config service — `/config/*` (MobileConfigController) */

import apiService from '../service/apiService';
import { MOBILE_CONFIG_ENDPOINTS } from '../config/api.config';

export interface MobileConfig {
  minSupportedVersion?: string;
  latestVersion?: string;
  forceUpdate?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  features?: Record<string, boolean>;
  [key: string]: unknown;
}

export const mobileConfigService = {
  get(): Promise<MobileConfig> {
    return apiService.get(MOBILE_CONFIG_ENDPOINTS.MOBILE);
  },
  update(payload: Partial<MobileConfig>): Promise<MobileConfig> {
    return apiService.post(MOBILE_CONFIG_ENDPOINTS.UPDATE, payload);
  },
  reset(): Promise<void> {
    return apiService.delete(MOBILE_CONFIG_ENDPOINTS.ROOT);
  },
};

export default mobileConfigService;
