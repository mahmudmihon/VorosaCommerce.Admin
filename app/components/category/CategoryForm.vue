<template>
  <div class="flex flex-col gap-4">
    <UTabs
      v-model="currentTab"
      :items="items"
      variant="link"
    >
      <template #general>
        <UForm
          :schema="generalSchema"
          :state="generalState"
          class="space-y-4 p-4"
          @submit="onGeneralSubmit"
        >
          <CategoryGeneralTab v-model:state="generalState" />
          <USeparator class="mt-6 max-w-[896px]" />

          <div class="flex max-w-[896px] justify-end gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="md"
              class="cursor-pointer"
              @click="onCancel"
            >
              Cancel
            </UButton>
            <UButton
              icon="solar:diskette-bold-duotone"
              size="md"
              color="primary"
              variant="solid"
              class="cursor-pointer"
            >
              Save
            </UButton>
          </div>
        </UForm>
      </template>
      <template #seo>
        <UForm
          :schema="seoSchema"
          :state="seoState"
          class="space-y-4 p-4"
          @submit="onSeoSubmit"
        >
          <CategorySeoTab :state="seoState" />
          <USeparator class="mt-6 max-w-[896px]" />

          <div class="flex max-w-[896px] justify-end gap-3">
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              size="md"
              class="cursor-pointer"
              @click="onCancel"
            >
              Cancel
            </UButton>
            <UButton
              icon="solar:diskette-bold-duotone"
              size="md"
              color="primary"
              variant="solid"
              class="cursor-pointer"
            >
              Save
            </UButton>
          </div>
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

const generalState = reactive<UpsertCategoryInfoDto>({
  Id: props.initialData?.Id,
  Name: props.initialData?.Name || '',
  Description: props.initialData?.Description,
  ParentCategoryId: props.initialData?.ParentCategoryId,
  IncludeInMenu: props.initialData?.IncludeInMenu ?? false,
  ShowOnHomePage: props.initialData?.ShowOnHomePage ?? false,
  Published: props.initialData?.Published ?? true,
  DisplayOrder: props.initialData?.DisplayOrder ?? 0,
  Picture: { PictureId: props.initialData?.Picture?.Id },
  Icon: { PictureId: props.initialData?.Icon?.Id }
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

function onCancel() {
  router.push('/category/list')
}
</script>
