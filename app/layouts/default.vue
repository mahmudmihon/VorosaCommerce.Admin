<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          :ui="{ link: 'py-2 font-semibold' }"
          class="cursor-pointer"
        />

        <!-- <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        /> -->
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>

<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'
  import type { SitemapNodeDto } from '~/types/identity/sitemap'

  const open = ref(false)

  const { sitemap, fetchSitemap } = useSitemap()

  const { loggedIn } = useUserSession()

  const route = useRoute()

  watch(loggedIn, async (isLoggedIn) => {
    if (!isLoggedIn || sitemap.value.Nodes.length) return
    await fetchSitemap()
  }, { immediate: true })

  const isRouteActive = (nodeRoute?: string | null, currentPath?: string): boolean => {
    if (!nodeRoute || !currentPath) return false

    // Exact match
    if (nodeRoute === currentPath) return true

    // Handle /category/list matching /category/create or /category/edit/:id
    let baseRoute = nodeRoute

    if (baseRoute.endsWith('/list')) {
      baseRoute = baseRoute.slice(0, -5)
    }

    // Check if current path starts with the base route (as a complete segment)
    // We check for exact match with baseRoute OR baseRoute + '/' to ensure we don't match /category-groups against /category
    if (currentPath === baseRoute) return true
    if (currentPath.startsWith(baseRoute + '/')) return true

    return false
  }

  const mapNode = (node: SitemapNodeDto): { item: NavigationMenuItem, isActive: boolean } => {
    const hasChildren = Array.isArray(node.ChildNodes) && node.ChildNodes.length > 0

    if (hasChildren) {
      const mappedChildren = node.ChildNodes!.map(mapNode)

      const children = mappedChildren.map(m => m.item)

      const isChildActive = mappedChildren.some(m => m.isActive)

      return {
        item: {
          label: node.Label,
          icon: node.IconClass || undefined,
          type: 'trigger' as const,
          defaultOpen: isChildActive,
          children: children
        },
        isActive: isChildActive
      }
    }

    const isActive = isRouteActive(node.Route, route.path)

    return {
      item: {
        label: node.Label,
        icon: node.IconClass || undefined,
        to: node.Route || '/',
        active: isActive,
        onSelect: () => {
          open.value = false
        }
      },
      isActive
    }
  }

  const toMenuItems = (nodes: SitemapNodeDto[]): NavigationMenuItem[] => {
    return nodes.map(node => mapNode(node).item)
  }

  const links = computed<NavigationMenuItem[][]>(() => {
    const items = toMenuItems(sitemap.value.Nodes || [])

    return [items]
  })

  const groups = computed(() => [{
    id: 'links',
    label: 'Go to',
    items: links.value.flat()
  }])
</script>
