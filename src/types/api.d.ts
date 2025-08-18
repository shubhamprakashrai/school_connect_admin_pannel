// src/types/api.d.ts
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
    statusCode: number;
  }
  
  export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
    timestamp?: string;
    path?: string;
  }
  
  export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    retries?: number;
    maxRetries?: number;
  }