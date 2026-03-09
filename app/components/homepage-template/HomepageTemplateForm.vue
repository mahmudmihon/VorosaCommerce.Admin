<template>
  <div class="flex flex-col gap-4 h-full overflow-auto">
    <div class="sticky top-0 z-10 flex justify-end gap-3 bg-default py-2">
      <UModal
        v-if="generalState.Id"
        v-model:open="deleteModalOpen"
        title="Delete template"
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
            aria-label="Delete template"
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
        icon="i-solar:diskette-bold-duotone"
        size="md"
        color="primary"
        variant="solid"
        class="cursor-pointer rounded-lg px-3"
        :loading="saveLoading"
        :disabled="!isFormValid"
        @click="onSave"
      >
        Save
      </UButton>
    </div>

    <UTabs
      v-model="currentTab"
      :items="items"
      orientation="vertical"
      variant="pill"
      color="primary"
      :ui="{
        list: 'mt-4 mb-auto items-start',
        trigger: 'w-full justify-start text-left cursor-pointer',
        label: 'text-left'
      }"
    >
      <template #general>
        <UForm
          :schema="generalSchema"
          :state="generalState"
          class="space-y-4 p-4 pb-8"
          @submit="onGeneralSubmit"
        >
          <HomepageTemplateGeneralTab v-model:state="generalState" />
        </UForm>
      </template>

      <template #menu>
        <div class="p-4 pb-8">
          <HomepageTemplateMenuTab v-if="templateId" :template-id="templateId" />
        </div>
      </template>

      <template #popular-products>
        <div class="p-4 pb-8">
          <HomepageTemplatePopularProductsTab v-if="templateId" :template-id="templateId" />
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import HomepageTemplateService from '~/services/HomepageTemplateService'
import type { UpsertHomepageTemplateDto } from '~/types/homepagetemplate/HomepageTemplate'
import HomepageTemplateGeneralTab from '~/components/homepage-template/HomepageTemplateGeneralTab.vue'
import HomepageTemplateMenuTab from '~/components/homepage-template/HomepageTemplateMenuTab.vue'
import HomepageTemplatePopularProductsTab from '~/components/homepage-template/HomepageTemplatePopularProductsTab.vue'

const props = defineProps<{
  templateId?: string
}>()

const router = useRouter()
const toast = useToast()

const currentTab = ref('general')
const saveLoading = ref(false)
const deleteLoading = ref(false)
const deleteModalOpen = ref(false)

const items = computed(() => {
  const tabs = [{
    label: 'General',
    slot: 'general',
    value: 'general'
  }]

  if (props.templateId) {
    tabs.push({
      label: 'Menu',
      slot: 'menu',
      value: 'menu'
    })
    tabs.push({
      label: 'Popular Products',
      slot: 'popular-products',
      value: 'popular-products'
    })
  }

  return tabs
})

const generalState = reactive<UpsertHomepageTemplateDto>({
  Id: undefined,
  Name: '',
  IsDefault: false,
  StartDate: undefined,
  EndDate: undefined
})

const generalSchema = z.object({
  Name: z.string().min(1, 'Name is required'),
  IsDefault: z.boolean(),
  StartDate: z.string().optional(),
  EndDate: z.string().optional()
}).refine((data) => {
  if (data.StartDate && data.EndDate) {
    const start = new Date(data.StartDate)
    const end = new Date(data.EndDate)
    return end > start
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['EndDate']
}).refine((data) => {
  if (data.StartDate && data.EndDate) {
    const start = new Date(data.StartDate)
    const end = new Date(data.EndDate)
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return diffInHours >= 1
  }
  return true
}, {
  message: 'There must be at least 1 hour interval between start and end date',
  path: ['EndDate']
})

const toLocalISOString = (dateStr?: string) => {
  if (!dateStr) return undefined
  const date = new Date(dateStr)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 16)
}

const toUTCISOString = (localDateStr?: string) => {
  if (!localDateStr) return undefined
  return new Date(localDateStr).toISOString()
}

const fetchTemplate = async () => {
  if (!props.templateId) return

  try {
    const template = await HomepageTemplateService.getHomepageTemplateById(props.templateId)

    Object.assign(generalState, {
      Id: template.Id,
      Name: template.Name,
      IsDefault: template.IsDefault,
      StartDate: toLocalISOString(template.StartDate),
      EndDate: toLocalISOString(template.EndDate)
    })
  }
  catch (error) {
    console.error('Failed to fetch template', error)
    toast.add({ title: 'Error', description: 'Failed to load template', color: 'error' })
  }
}

onMounted(() => {
  fetchTemplate()
})

const isFormValid = computed(() => {
  const result = generalSchema.safeParse(generalState)
  return result.success
})

const onSave = async () => {
  const result = generalSchema.safeParse(generalState)

  if (!result.success) {
    const firstError = result.error.issues[0]?.message || 'Please check the form for errors'

    toast.add({ title: 'Validation Error', description: firstError, color: 'error' })

    return
  }

  await onGeneralSubmit()
}

const onGeneralSubmit = async () => {
  saveLoading.value = true
  try {
    const payload = {
      ...generalState,
      StartDate: toUTCISOString(generalState.StartDate),
      EndDate: toUTCISOString(generalState.EndDate)
    }
    const result = await HomepageTemplateService.upsertHomepageTemplate(payload)
    toast.add({ title: 'Success', description: 'Template saved successfully', color: 'success' })

    if (!generalState.Id && result.Id) {
      router.push(`/homepage-template/edit/${result.Id}`)
    }
    else {
        // Update state with result to ensure consistency
        Object.assign(generalState, {
          Id: result.Id,
          Name: result.Name,
          IsDefault: result.IsDefault,
          StartDate: toLocalISOString(result.StartDate),
          EndDate: toLocalISOString(result.EndDate)
        })
    }
  }
  catch (error) {
    console.error('Failed to save template', error)
    toast.add({ title: 'Error', description: 'Failed to save template', color: 'error' })
  }
  finally {
    saveLoading.value = false
  }
}

const onDelete = async () => {
  if (!generalState.Id) return

  deleteLoading.value = true
  try {
    await HomepageTemplateService.deleteHomepageTemplate(generalState.Id)
    toast.add({ title: 'Success', description: 'Template deleted successfully', color: 'success' })
    router.push('/homepage-template/list')
  }
  catch (error) {
    console.error('Failed to delete template', error)
    toast.add({ title: 'Error', description: 'Failed to delete template', color: 'error' })
  }
  finally {
    deleteLoading.value = false
    deleteModalOpen.value = false
  }
}
</script>
