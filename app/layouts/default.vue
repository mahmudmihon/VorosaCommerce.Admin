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
          :ui="{ link: 'py-2' }",
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
  import SitemapService from '~/services/SitemapService'
  import type { SitemapNodeDto } from '~/types/identity/sitemap'
  import type { SitemapNodeWithPermissionDto } from '~/types/identity/sitemap-with-permission'

  const open = ref(false)

  const sitemap = ref<SitemapNodeWithPermissionDto>({
    UserId: '',
    RBACVersion: 0,
    Nodes: [],
    PermissionActions: []
  })

  const { loggedIn } = useUserSession()

  watch(loggedIn, async (isLoggedIn) => {
    if (!isLoggedIn || sitemap.value.Nodes.length) return
    try {
      sitemap.value = await SitemapService.getSitemapWithPermission()
    }
    catch {}
  }, { immediate: true })

  const toMenuItems = (nodes: SitemapNodeDto[]): NavigationMenuItem[] => {
    return nodes.map((node) => {
      const hasChildren = Array.isArray(node.ChildNodes) && node.ChildNodes.length > 0
      if (hasChildren) {
        return {
          label: node.Label,
          icon: node.IconClass || undefined,
          type: 'trigger' as const,
          defaultOpen: false,
          children: toMenuItems(node.ChildNodes!)
        }
      }
      return {
        label: node.Label,
        icon: node.IconClass || undefined,
        to: node.Route || '/',
        onSelect: () => {
          open.value = false
        }
      }
    })
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
