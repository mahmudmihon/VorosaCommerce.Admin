import ApiService from './ApiService';

class BaseService {
  protected apiService: typeof ApiService;

  constructor() {
    this.apiService = ApiService;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return await this.apiService<T>(endpoint, { params });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return await this.apiService<T>(endpoint, { method: 'POST', body: data });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return await this.apiService<T>(endpoint, { method: 'PUT', body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return await this.apiService<T>(endpoint, { method: 'DELETE' });
  }
}

export default new BaseService();
