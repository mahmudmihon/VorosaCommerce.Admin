import ApiService from './ApiService';
import type { FetchOptions } from 'ofetch';

type JsonBody = FetchOptions<'json'>['body']

class BaseService {
  protected apiService: typeof ApiService;

  constructor() {
    this.apiService = ApiService;
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return await this.apiService<T>(endpoint, { params });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return await this.apiService<T>(endpoint, { method: 'POST', body: data as JsonBody });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return await this.apiService<T>(endpoint, { method: 'PUT', body: data as JsonBody });
  }

  async delete<T = void>(endpoint: string, data?: unknown): Promise<T> {
    return await this.apiService<T>(endpoint, { method: 'DELETE', body: data as JsonBody });
  }
}

export default new BaseService();
