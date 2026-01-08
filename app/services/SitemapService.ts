import BaseService from './BaseService';
import type { SitemapNodeWithPermissionDto } from '~/types/identity/sitemap-with-permission';
import { useUserSession } from '#imports';

const resource = '/api/v1/admin/sitemap';

class SitemapService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getSitemapWithPermission(): Promise<SitemapNodeWithPermissionDto> {
    const { session } = useUserSession();

    const userId = session.value?.user?.userId;

    const rbacVersion = session.value?.user?.rbacVersion;

    if (userId && typeof rbacVersion === 'number') {
      const key = `${userId}_${rbacVersion}`;

      const cached = typeof window !== 'undefined' ? localStorage.getItem(key) : null;

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as SitemapNodeWithPermissionDto;

          return parsed;
        } catch {}
      }

      const fresh = await this.baseService.get<SitemapNodeWithPermissionDto>(resource);

      try {
        localStorage.setItem(key, JSON.stringify(fresh));
      }
      catch {}

      return fresh;
    }

    const fresh = await this.baseService.get<SitemapNodeWithPermissionDto>(resource);

    const key = `${fresh.UserId}_${fresh.RBACVersion}`;

    try {
      localStorage.setItem(key, JSON.stringify(fresh));
    }
    catch {}

    return fresh;
  }
}

export default new SitemapService();
