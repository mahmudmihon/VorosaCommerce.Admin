import BaseService from './BaseService';
import type { PagedList } from '~/types/common/PagedList';
import type { RoleDto, UpsertRoleDto } from '~/types/identity/Role';
import type { RolePermissionSummaryDto, RolePermissionUpdateDto } from '~/types/identity/RolePermission';

const resource = '/api/v1/admin/role';

class RoleService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getRoles(params: Record<string, unknown>): Promise<PagedList<RoleDto>> {
    return await this.baseService.get<PagedList<RoleDto>>(resource, params);
  }

  async getRoleById(id: string): Promise<RoleDto> {
    return await this.baseService.get<RoleDto>(`${resource}/${id}`);
  }

  async upsertRole(command: UpsertRoleDto): Promise<RoleDto> {
    return await this.baseService.post<RoleDto>(`${resource}/upsert`, command);
  }

  async deleteRole(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/${id}`);
  }

  async getRolePermissionSummary(id: string): Promise<RolePermissionSummaryDto> {
    return await this.baseService.get<RolePermissionSummaryDto>(`${resource}/permissions?roleId=${id}`);
  }

  async updateRolePermissions(payload: RolePermissionUpdateDto): Promise<void> {
    await this.baseService.put(`${resource}/permissions`, payload);
  }
}

export default new RoleService();
