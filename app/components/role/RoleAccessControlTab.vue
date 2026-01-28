<template>
  <div class="space-y-4">
    <UCard variant="soft" class="flex flex-col p-2 rounded-2xl">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:shield-star-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Access Control</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Manage permissions and actions for this role</p>
    </UCard>

    <UTable
      v-model:expanded="expanded"
      v-model:grouping="grouping"
      :data="groupedTableData"
      :columns="columns"
      :loading="loading"
      :get-row-id="getRowId"
      :get-expanded-row-model="getExpandedRowModel()"
      :grouping-options="{
        getGroupedRowModel: getGroupedRowModel()
      }"
      class="shrink-0"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0 [&>tr:has(>td[colspan]:empty)]:hidden',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'hidden'
      }"
    />

    <UModal
      v-model:open="actionsModalOpen"
      :title="actionsModalTitle"
      :description="actionsModalDescription"
    >
      <template #body>
        <div class="space-y-4">
          <div class="space-y-3">
            <UCheckbox
              v-for="action in currentActions"
              :key="action"
              v-model="actionForm[action]"
              :label="action"
            />
          </div>

          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer"
              @click="actionsModalOpen = false"
            />
            <UButton
              label="Save"
              color="primary"
              variant="solid"
              class="cursor-pointer"
              @click="saveActions"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import type { TableColumn } from '@nuxt/ui'
  import { getExpandedRowModel, getGroupedRowModel } from '@tanstack/table-core'
  import { h, resolveComponent } from 'vue'
  import RoleService from '~/services/RoleService'
  import type { PermissionDto, RolePermissionSummaryDto, RolePermissionUpdateDto } from '~/types/identity/RolePermission'

  const props = defineProps<{
    roleId: string
    roleName?: string
  }>()

  type PermissionRow = {
    rowType: 'permission'
    id: string
    Name: string
    groupName: string
    permission: PermissionDto
  }

  type TableRow = PermissionRow

  const toast = useToast()
  const loading = ref(false)
  const data = ref<RolePermissionSummaryDto | null>(null)
  const selectedActionsByPermission = reactive<Record<string, string[]>>({})

  const UButton = resolveComponent('UButton')
  const UIcon = resolveComponent('UIcon')
  const UCheckbox = resolveComponent('UCheckbox')

  const columns = computed<TableColumn<TableRow>[]>(() => [
    {
      id: 'groupName',
      accessorKey: 'groupName',
      header: 'Name',
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          const canExpand = row.getCanExpand() && row.subRows.length > 0
          return h('div', { class: 'flex items-center gap-3' }, [
            canExpand
              ? h(UButton, {
                icon: row.getIsExpanded() ? 'i-solar:minus-circle-bold-duotone' : 'i-solar:add-circle-bold-duotone',
                color: 'neutral',
                variant: 'soft',
                size: 'xs',
                square: true,
                class: 'cursor-pointer',
                onClick: row.getToggleExpandedHandler()
              })
              : h('div', { class: 'size-6' }),
            h('span', { class: 'font-semibold text-highlighted' }, row.getValue('groupName') || '')
          ])
        }

        const original = row.original as PermissionRow
        return h('div', { class: 'flex items-center gap-3 pl-8' }, [
          h('span', { class: 'text-sm text-muted-foreground font-semibold' }, original.Name)
        ])
      }
    },
    {
      id: 'access',
      header: 'Access',
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null
        const original = row.original as PermissionRow
        if (editingId.value === original.id) {
          return h(UCheckbox, {
            modelValue: accessEditValue.value,
            'onUpdate:modelValue': (val: boolean) => {
              accessEditValue.value = !!val
              if (accessEditValue.value && editingPermission.value) {
                selectedActionsByPermission[editingPermission.value.SystemName] = [...(editingPermission.value.Actions || [])]
              }
            }
          })
        }
        return h(UIcon, {
          name: hasAccess(original) ? 'i-solar:check-circle-bold-duotone' : 'i-solar:close-circle-bold-duotone',
          class: `size-5 ${hasAccess(original) ? 'text-primary' : 'text-red-500'}`
        })
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null
        const original = row.original as PermissionRow
        return h(UButton, {
          icon: 'solar:settings-bold-duotone',
          variant: 'ghost',
          color: 'neutral',
          class: 'cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10',
          onClick: () => openActions(original.permission)
        })
      }
    },
    {
      id: 'edit',
      header: '',
      cell: ({ row }) => {
        if (row.getIsGrouped()) return null
        const original = row.original as PermissionRow
        if (editingId.value === original.id) {
          return h('div', { class: 'flex items-center gap-2' }, [
            h(UButton, {
              label: 'Update',
              color: 'primary',
              variant: 'soft',
              class: 'cursor-pointer',
              onClick: () => saveAccessEdit(original)
            }),
            h(UButton, {
              label: 'Cancel',
              color: 'neutral',
              variant: 'subtle',
              class: 'cursor-pointer',
              onClick: cancelEdit
            })
          ])
        }

        return h(UButton, {
          icon: 'i-solar:pen-new-square-bold-duotone',
          variant: 'ghost',
          color: 'neutral',
          class: 'cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10',
          onClick: () => startEdit(original)
        })
      }
    }
  ])

  const grouping = ref<string[]>(['groupName'])
  const expanded = ref<Record<string, boolean>>({})

  const groupedTableData = computed<TableRow[]>(() => {
    const permissions = data.value?.AllPermissions ?? []
    const grouped = new Map<string, PermissionDto[]>()

    permissions.forEach((permission) => {
      const key = permission.Category || 'General'
      const existing = grouped.get(key) || []
      existing.push(permission)
      grouped.set(key, existing)
    })

    const rows: TableRow[] = []
    const sortedCategories = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b))

    sortedCategories.forEach((category) => {
      const items = grouped.get(category) || []
      items.sort((a, b) => a.Name.localeCompare(b.Name))
      items.forEach(permission => {
        rows.push({
          rowType: 'permission',
          id: permission.SystemName,
          Name: permission.Name,
          groupName: category,
          permission
        })
      })
    })

    return rows
  })

  const getRowId = (row: TableRow) => row.id

  const hasAccess = (row: PermissionRow): boolean => {
    const explicit = selectedAccessByPermission[row.permission.SystemName]
    if (typeof explicit === 'boolean') return explicit
    const selected = selectedActionsByPermission[row.permission.SystemName] || []
    return selected.length > 0
  }

  const actionsModalOpen = ref(false)
  const saving = ref(false)
  const currentPermission = ref<PermissionDto | null>(null)
  const editingPermission = ref<PermissionDto | null>(null)
  const actionForm = reactive<Record<string, boolean>>({})
  const selectedAccessByPermission = reactive<Record<string, boolean>>({})
  const editingId = ref<string | null>(null)
  const accessEditValue = ref<boolean>(false)

  const currentActions = computed(() => currentPermission.value?.Actions || [])

  const actionsModalTitle = computed(() => {
    if (!currentPermission.value) return 'Actions'
    const roleSuffix = props.roleName ? ` - ${props.roleName}` : ''
    return `Actions (${currentPermission.value.Name}${roleSuffix})`
  })

  const actionsModalDescription = computed(() => {
    if (!currentPermission.value) return undefined
    return 'Select actions for this permission'
  })

  const openActions = (permission: PermissionDto) => {
    currentPermission.value = permission
    const selected = new Set(selectedActionsByPermission[permission.SystemName] || [])
    Object.keys(actionForm).forEach(key => {
      actionForm[key] = false
    })
    permission.Actions.forEach(action => {
      actionForm[action] = selected.has(action)
    })
    actionsModalOpen.value = true
  }

  const saveActions = () => {
    if (!currentPermission.value) return

    const selected = Object.entries(actionForm)
      .filter(([, value]) => value)
      .map(([key]) => key)

    selectedActionsByPermission[currentPermission.value.SystemName] = selected

    selectedAccessByPermission[currentPermission.value.SystemName] = selected.length > 0

    actionsModalOpen.value = false
  }

  const startEdit = (row: PermissionRow) => {
    editingId.value = row.id
    editingPermission.value = row.permission
    accessEditValue.value = hasAccess(row)
  }

  const cancelEdit = () => {
    editingId.value = null
    editingPermission.value = null
  }

  const saveAccessEdit = (row: PermissionRow) => {
    const systemName = row.permission.SystemName

    selectedAccessByPermission[systemName] = accessEditValue.value

    if (accessEditValue.value) {
      const actions = row.permission.Actions || []
      selectedActionsByPermission[systemName] = actions
    }
    editingId.value = null
    editingPermission.value = null
  }

  const resolveActions = (permission: PermissionDto): string[] => {
    const explicitAccess = selectedAccessByPermission[permission.SystemName]

    const selected = selectedActionsByPermission[permission.SystemName] || []

    if (explicitAccess === false) return []

    if (explicitAccess === true && selected.length === 0) {
      const fallback = permission.Actions || []

      selectedActionsByPermission[permission.SystemName] = fallback

      return fallback
    }

    return selected
  }

  const buildPermissionPayload = (): RolePermissionUpdateDto | null => {
    if (!data.value) return null
    const permissions = data.value.AllPermissions
      .map(permission => ({
        ...permission,
        Actions: resolveActions(permission)
      }))
      .filter(permission => permission.Actions.length > 0)
    return {
      RoleId: props.roleId,
      Permissions: permissions
    }
  }

  const savePermissions = async () => {
    const payload = buildPermissionPayload()
    if (!payload) return false
    const current = data.value
    if (!current) return false
    saving.value = true
    try {
      await RoleService.updateRolePermissions(payload)
      data.value = {
        ...current,
        RolePermissions: payload.Permissions.filter(permission => permission.Actions.length > 0)
      }
      toast.add({ title: 'Saved', description: 'Permissions updated', color: 'success' })
      return true
    }
    catch (error) {
      console.error('Error updating role permissions:', error)
      toast.add({ title: 'Error', description: 'Failed to update permissions', color: 'error' })
      return false
    }
    finally {
      saving.value = false
    }
  }

  defineExpose({
    savePermissions
  })

  const fetchPermissions = async () => {
    loading.value = true
    try {
      const response = await RoleService.getRolePermissionSummary(props.roleId)
      data.value = response

      const rolePermissions = response.RolePermissions || []
      rolePermissions.forEach(permission => {
        selectedActionsByPermission[permission.SystemName] = permission.Actions || []
        selectedAccessByPermission[permission.SystemName] = (permission.Actions || []).length > 0
      })
    }
    catch (error) {
      console.error('Error fetching role permissions:', error)
      toast.add({ title: 'Error', description: 'Failed to load permissions', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  watch(() => props.roleId, () => {
    fetchPermissions()
  }, { immediate: true })
</script>
