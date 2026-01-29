<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-[896px] p-2 rounded-2xl"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:notes-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Basic Information</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Define the core details of the customer</p>

    <div class="grid gap-5 sm:grid-cols-2 mt-6">
      <UFormField
        label="First Name"
        name="FirstName"
        class="font-medium"
        required
      >
        <UInput
          v-model="state.FirstName"
          variant="outline"
          size="xl"
          placeholder="Enter first name"
          class="w-full rounded-2xl"
        />
      </UFormField>

      <UFormField
        label="Last Name"
        name="LastName"
        class="font-medium"
        required
      >
        <UInput
          v-model="state.LastName"
          variant="outline"
          size="xl"
          placeholder="Enter last name"
          class="w-full rounded-2xl"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Email"
        name="Email"
        class="font-medium"
        required
      >
        <UInput
          v-model="state.Email"
          variant="outline"
          size="xl"
          type="email"
          placeholder="Enter email"
          class="w-full rounded-2xl"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="Password"
        class="font-medium"
      >
        <UInput
          v-model="state.Password"
          variant="outline"
          size="xl"
          type="password"
          placeholder="Leave blank to keep current password"
          class="w-full rounded-2xl"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Role"
        name="RoleId"
        class="font-medium"
        required
      >
        <USelectMenu
          v-model="selectedRoleId"
          :items="roleOptions"
          searchable
          placeholder="Select role"
          value-key="value"
          label-key="label"
          class="w-full"
          size="xl"
        />
      </UFormField>
    </div>
  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-[896px] p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:shield-check-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Status</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Control whether the customer is active</p>

    <div class="flex flex-wrap gap-6 mt-6">
      <UCheckbox
        v-model="state.Active"
        label="Active"
        name="Active"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import RoleService from '~/services/RoleService'
  import type { RoleDto } from '~/types/identity/Role'
  import type { PagedList } from '~/types/common/PagedList'
  import type { UpsertCustomerDto } from '~/types/identity/Customer'

  const state = defineModel<UpsertCustomerDto>('state', { required: true })

  type RoleOption = { label: string, value: string }

  const roles = ref<PagedList<RoleDto> | null>(null)

  onMounted(async () => {
    roles.value = await RoleService.getRoles({ CurrentPage: 1, PageSize: 1000 })
  })

  const roleOptions = computed<RoleOption[]>(() => {
    return roles.value?.Items?.map(role => ({ label: role.Name, value: role.Id })) || []
  })

  const selectedRoleId = computed<string | undefined>({
    get: () => state.value.RoleId || undefined,
    set: (val) => {
      state.value.RoleId = val || ''
    }
  })
</script>
