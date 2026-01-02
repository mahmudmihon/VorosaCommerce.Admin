import type { SitemapNode } from '~/types/sitemap/sitemap';
import BaseService from './BaseService';

const resource = '/api/v1/admin/sitemap';

class SitemapService {
  protected baseService: typeof BaseService;

  constructor() {
    this.baseService = BaseService;
  }

  async getSitemap(): Promise<SitemapNode[]> {
    return await this.baseService.get<SitemapNode[]>(resource);
  }
}

export default new SitemapService();
