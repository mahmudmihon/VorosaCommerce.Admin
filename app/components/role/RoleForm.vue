<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <UTabs
      v-model="currentTab"
      :items="items"
      variant="link"
      :ui="{ list: 'sticky top-0 z-10 bg-default', trigger: 'cursor-pointer' }"
    >
      <template #list-trailing>
        <div class="ml-auto flex items-center gap-3">
          <UModal
            v-if="state.Id"
            v-model:open="deleteModalOpen"
            title="Delete role"
            description="This action cannot be undone."
          >
            <UTooltip text="Delete">
              <UButton
                icon="i-solar:trash-bin-2-bold-duotone"
                color="error"
                variant="soft"
                square
                size="md"
                :loading="deleteLoading"
                aria-label="Delete role"
                class="cursor-pointer rounded-lg px-3"
              >
                Delete
              </UButton>
            </UTooltip>

            <template #body>
              <div class="flex justify-end gap-2">
                <UButton
                  label="Cancel"
                  color="neutral"
                  variant="subtle"
                  :disabled="deleteLoading"
                  class="cursor-pointer rounded-lg px-3"
                  @click="deleteModalOpen = false"
                />
                <UButton
                  label="Delete"
                  color="error"
                  variant="solid"
                  :loading="deleteLoading"
                  class="cursor-pointer rounded-lg px-3"
                  @click="onDelete"
                />
              </div>
            </template>
          </UModal>
          <UButton
            icon="solar:diskette-bold-duotone"
            size="md"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            @click="onSubmit"
          >
            Save
          </UButton>
        </div>
      </template>
      <template #general>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 p-4 pb-8"
          @submit="onSubmit"
        >
          <RoleGeneralTab v-model:state="state" />
        </UForm>
      </template>
      <template #access>
        <div class="space-y-4 p-4 pb-8">
          <GenericAlert
            v-if="!state.Id"
            :title="unsavedAlertTitle"
            :description="unsavedAlertDescription"
            color="warning"
            variant="soft"
          />
          <RoleAccessControlTab
            v-else
            ref="accessControlRef"
            :role-id="state.Id"
            :role-name="state.Name"
          />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '@nuxt/ui'
  import RoleService from '~/services/RoleService'
  import type { RoleDto, UpsertRoleDto } from '~/types/identity/Role'
  import RoleGeneralTab from './RoleGeneralTab.vue'
  import GenericAlert from '~/components/common/GenericAlert.vue'

  const props = defineProps<{
    initialData?: RoleDto
  }>()

  const router = useRouter()
  const toast = useToast()
  const currentTab = ref('general')
  const deleteModalOpen = ref(false)
  const deleteLoading = ref(false)
  type AccessControlRef = { savePermissions: () => Promise<boolean> }
  const accessControlRef = ref<AccessControlRef | null>(null)
  const unsavedAlertTitle = 'Save general information first'
  const unsavedAlertDescription = 'Save the role before managing access control.'

  const state = reactive<UpsertRoleDto>({
    Id: props.initialData?.Id,
    Name: props.initialData?.Name || '',
    SystemName: props.initialData?.SystemName || '',
    Active: props.initialData?.Active ?? true
  })

  const items = ref<TabsItem[]>([
    {
      label: 'General',
      slot: 'general',
      value: 'general'
    },
    {
      label: 'Access Control',
      slot: 'access',
      value: 'access'
    }
  ])

  const schema = z.object({
    Name: z.string().min(1, 'Name is required'),
    SystemName: z.string().min(1, 'System Name is required'),
    Active: z.boolean()
  })

  async function onSubmit() {
    try {
      const result = await RoleService.upsertRole(state)

      toast.add({ title: 'Success', description: 'Role saved successfully', color: 'success' })

      if (!state.Id) {
        state.Id = result.Id
        router.push(`/role/edit/${result.Id}`)
      }
      else {
        state.Id = result.Id
      }

      if (state.Id && accessControlRef.value) {
        await accessControlRef.value.savePermissions()
      }
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save role', color: 'error' })
    }
  }

  async function onDelete() {
    if (!state.Id) return

    deleteLoading.value = true
    try {
      await RoleService.deleteRole(state.Id)
      deleteModalOpen.value = false
      toast.add({ title: 'Deleted', description: 'Role deleted successfully', color: 'success' })
      router.push('/role/list')
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete role', color: 'error' })
    }
    finally {
      deleteLoading.value = false
    }
  }
</script>
