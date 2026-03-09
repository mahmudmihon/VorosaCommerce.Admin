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
          <UButton
            icon="solar:diskette-bold-duotone"
            size="md"
            color="primary"
            variant="solid"
            class="cursor-pointer rounded-lg px-3"
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
          <CustomerGeneralTab v-model:state="state" />
        </UForm>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { TabsItem } from '@nuxt/ui'
  import CustomerService from '~/services/CustomerService'
  import type { CustomerDto, UpsertCustomerDto } from '~/types/identity/Customer'
  import CustomerGeneralTab from './CustomerGeneralTab.vue'

  const props = defineProps<{
    initialData?: CustomerDto
  }>()

  const router = useRouter()
  const toast = useToast()
  const currentTab = ref('general')

  const state = reactive<UpsertCustomerDto>({
    Id: props.initialData?.Id,
    FirstName: props.initialData?.FirstName || '',
    LastName: props.initialData?.LastName || '',
    Email: props.initialData?.Email || '',
    Password: '',
    Active: props.initialData?.Active ?? true,
    RoleId: props.initialData?.Roles?.[0] || ''
  })

  const items = ref<TabsItem[]>([
    {
      label: 'General',
      slot: 'general',
      value: 'general'
    }
  ])

  const schema = z.object({
    FirstName: z.string().min(1, 'First name is required'),
    LastName: z.string().min(1, 'Last name is required'),
    Email: z.string().email('Email is required'),
    Password: z.string().optional(),
    Active: z.boolean(),
    RoleId: z.string().min(1, 'Role is required')
  })

  async function onSubmit() {
    const payload: UpsertCustomerDto = {
      ...state,
      Password: state.Password?.trim() ? state.Password : undefined
    }

    try {
      const result = await CustomerService.upsertCustomer(payload)
      toast.add({ title: 'Success', description: 'Customer saved successfully', color: 'success' })

      if (!state.Id) {
        state.Id = result.Id
        router.push(`/customer/edit/${result.Id}`)
      }
      else {
        state.Id = result.Id
      }

      state.Password = ''
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save customer', color: 'error' })
    }
  }
</script>
