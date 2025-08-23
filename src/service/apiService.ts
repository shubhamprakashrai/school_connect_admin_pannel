// src/services/apiService.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError, RequestOptions } from '@/types/api';

class ApiService {
  private api: AxiosInstance;
  private retryCount: number = 0;
  private maxRetries: number = 1;
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );


    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        this.retryCount = 0; // Reset retry count on successful response
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as any;
        
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          // Clear auth data and redirect to login
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        // Handle network errors with retry logic
        if (error.code === 'ECONNABORTED' || !error.response) {
          if (this.retryCount < (originalRequest?._retryCount || this.maxRetries)) {
            this.retryCount++;
            const delay = Math.pow(2, this.retryCount) * 1000; // Exponential backoff
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(this.api(originalRequest));
              }, delay);
            });
          }
        }
        return Promise.reject(error);
      }
    );

  }

  private async request<T = any>(config: AxiosRequestConfig, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...config.headers,
          ...options.headers,
        },
        params: options.params,
      };
      
      // Store retry count in a separate property if needed for interceptors
      if (options.retries !== undefined) {
        (requestConfig as any)._retryCount = options.retries;
      } else if (this.retryCount > 0) {
        (requestConfig as any)._retryCount = this.retryCount;
      }

      const response = await this.api.request<ApiResponse<T>>(requestConfig);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response) {
        throw {
          message: axiosError.response.data?.message || 'An error occurred',
          statusCode: axiosError.response.status,
          errors: axiosError.response.data?.errors,
        } as ApiError;
      }
      const errorMessage = error instanceof Error ? error.message : 'Network Error';
      throw {
        message: errorMessage,
        statusCode: 0,
      } as ApiError;
    }
  }

  public async get<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url }, options);
  }

  public async post<T = any, D = any>(url: string, data?: D, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data }, options);
  }

  public async put<T = any, D = any>(url: string, data?: D, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data }, options);
  }

  public async delete<T = any>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url }, options);
  }

  public async patch<T = any, D = any>(url: string, data?: D, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data }, options);
  }
}

export const apiService = new ApiService();
export default apiService;