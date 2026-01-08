import type { SitemapNodeWithPermissionDto } from '~/types/identity/sitemap-with-permission'
import SitemapService from '~/services/SitemapService'

export const useSitemap = () => {
  const sitemap = useState<SitemapNodeWithPermissionDto>('sitemap', () => ({
    UserId: '',
    RBACVersion: 0,
    Nodes: [],
    Permissions: []
  }))

  const fetchSitemap = async () => {
    try {
      sitemap.value = await SitemapService.getSitemapWithPermission()
    }
    catch (error) {
      console.error('Failed to fetch sitemap', error)
    }
  }

  const hasPermission = (systemName: string, action: string): boolean => {
    const permission = sitemap.value.Permissions?.find(
      p => p.SystemName === systemName
    )

    if (!permission) return false

    return permission.Actions.includes(action)
  }

  return {
    sitemap,
    fetchSitemap,
    hasPermission
  }
}
