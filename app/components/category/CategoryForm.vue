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
            v-if="generalState.Id"
            v-model:open="deleteModalOpen"
            title="Delete category"
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
                aria-label="Delete category"
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
            class="cursor-pointer rounded-lg px-3"
            @click="currentTab === 'general' ? onGeneralSubmit() : onSeoSubmit()"
          >
            Save
          </UButton>
        </div>
      </template>
      <template #general>
        <UForm
          :schema="generalSchema"
          :state="generalState"
          class="space-y-4 p-4 pb-8"
          @submit="onGeneralSubmit"
        >
          <CategoryGeneralTab v-model:state="generalState" />
        </UForm>
      </template>
      <template #seo>
        <UForm
          :schema="seoSchema"
          :state="seoState"
          class="space-y-4 p-4 pb-8"
          @submit="onSeoSubmit"
        >
          <CategorySeoTab v-model:state="seoState" />
        </UForm>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { TabsItem } from '@nuxt/ui'
import CategoryService from '~/services/CategoryService'
import type { CategoryDto, UpsertCategoryInfoDto, UpsertCategorySEOInfoDto } from '~/types/catalog/Category'
import CategoryGeneralTab from './CategoryGeneralTab.vue'
import CategorySeoTab from './CategorySeoTab.vue'

const props = defineProps<{
  initialData?: CategoryDto
}>()

const router = useRouter()
const toast = useToast()
const currentTab = ref('general')
const deleteModalOpen = ref(false)
const deleteLoading = ref(false)

const generalState = reactive<UpsertCategoryInfoDto>({
  Id: props.initialData?.Id,
  Name: props.initialData?.Name || '',
  Description: props.initialData?.Description,
  ParentCategoryId: props.initialData?.ParentCategoryId,
  IncludeInMenu: props.initialData?.IncludeInMenu ?? false,
  ShowOnHomePage: props.initialData?.ShowOnHomePage ?? false,
  Published: props.initialData?.Published ?? true,
  DisplayOrder: props.initialData?.DisplayOrder ?? 0,
  Picture: { PictureId: props.initialData?.Picture?.Id, Url: props.initialData?.Picture?.Url },
  Icon: { PictureId: props.initialData?.Icon?.Id, Url: props.initialData?.Icon?.Url }
})

const seoState = reactive<UpsertCategorySEOInfoDto>({
  Id: props.initialData?.Id || '',
  SeName: props.initialData?.SeName || '',
  MetaKeywords: props.initialData?.MetaKeywords,
  MetaDescription: props.initialData?.MetaDescription,
  MetaTitle: props.initialData?.MetaTitle
})

const items = ref<TabsItem[]>([
  {
    label: 'General',
    slot: 'general',
    value: 'general'
  },
  {
    label: 'SEO',
    slot: 'seo',
    value: 'seo'
  }
])

const generalSchema = z.object({
  Name: z.string().min(1, 'Name is required'),
  DisplayOrder: z.coerce.number()
})

const seoSchema = z.object({
  SeName: z.string().min(1, 'SEO Name is required')
})

async function onGeneralSubmit() {
  try {
    const result = await CategoryService.upsertCategory(generalState)

    toast.add({ title: 'Success', description: 'Category saved successfully', color: 'success' })

    if (!generalState.Id) {
      generalState.Id = result.Id
      seoState.Id = result.Id
      router.push(`/category/edit/${result.Id}`)
    }
    else {
      generalState.Id = result.Id
      seoState.Id = result.Id
    }
  }
  catch {
    toast.add({ title: 'Error', description: 'Failed to save category', color: 'error' })
  }
}

async function onSeoSubmit() {
  try {
    await CategoryService.updateCategorySeo(seoState)
    toast.add({ title: 'Success', description: 'SEO info updated successfully', color: 'success' })
  }
  catch {
    toast.add({ title: 'Error', description: 'Failed to update SEO info', color: 'error' })
  }
}

async function onDelete() {
  if (!generalState.Id) return

  deleteLoading.value = true
  try {
    await CategoryService.deleteCategory(generalState.Id)
    deleteModalOpen.value = false
    toast.add({ title: 'Deleted', description: 'Category deleted successfully', color: 'success' })
    router.push('/category/list')
  }
  catch {
    toast.add({ title: 'Error', description: 'Failed to delete category', color: 'error' })
  }
  finally {
    deleteLoading.value = false
  }
}
</script>
