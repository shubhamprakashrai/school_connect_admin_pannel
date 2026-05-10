/** Master-data service — `/master-data/*` */

import apiService from '../service/apiService';
import { MASTER_DATA_ENDPOINTS } from '../config/api.config';
import type {
  CreateMasterDataRequest,
  MasterDataResponse,
  UpdateMasterDataRequest,
} from '../types/masterData';

export const masterDataService = {
  /** GET /master-data?category=… */
  byCategory(category: string): Promise<MasterDataResponse[]> {
    return apiService.getList(MASTER_DATA_ENDPOINTS.ROOT, { params: { category } });
  },
  /** GET /master-data/all */
  all(): Promise<MasterDataResponse[]> {
    return apiService.getList(MASTER_DATA_ENDPOINTS.ALL);
  },
  /** GET /master-data/categories — distinct category codes for the tenant */
  categories(): Promise<string[]> {
    return apiService.getList(MASTER_DATA_ENDPOINTS.CATEGORIES);
  },
  create(payload: CreateMasterDataRequest): Promise<MasterDataResponse> {
    return apiService.post(MASTER_DATA_ENDPOINTS.ROOT, payload);
  },
  update(id: string, payload: UpdateMasterDataRequest): Promise<MasterDataResponse> {
    return apiService.put(MASTER_DATA_ENDPOINTS.byId(id), payload);
  },
  remove(id: string): Promise<void> {
    return apiService.delete(MASTER_DATA_ENDPOINTS.byId(id));
  },
};

export default masterDataService;
