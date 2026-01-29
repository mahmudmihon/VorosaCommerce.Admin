import BaseService from './BaseService';
import type { PagedList } from '~/types/common/PagedList';
import type { CustomerDto, UpsertCustomerDto } from '~/types/identity/Customer';

const resource = '/api/v1/admin/customer';

class CustomerService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getCustomers(params: Record<string, unknown>): Promise<PagedList<CustomerDto>> {
    return await this.baseService.get<PagedList<CustomerDto>>(resource, params);
  }

  async getCustomerById(id: string): Promise<CustomerDto> {
    return await this.baseService.get<CustomerDto>(`${resource}/${id}`);
  }

  async upsertCustomer(payload: UpsertCustomerDto): Promise<CustomerDto> {
    return await this.baseService.post<CustomerDto>(`${resource}/upsert`, payload);
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`);
  }
}

export default new CustomerService();
