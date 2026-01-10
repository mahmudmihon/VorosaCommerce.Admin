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
    <p class="text-sm text-muted-foreground mt-2">Define the core details of your category</p>

    <UFormField
      label="Name"
      name="Name"
      class="mt-6 font-medium"
      required
    >
      <UInput
        v-model="state.Name"
        variant="outline"
        size="xl"
        placeholder="Enter category name"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <UFormField
      label="Description"
      name="Description"
      class="mt-4 font-medium"
    >
      <UTextarea
        v-model="state.Description"
        :rows="6"
        placeholder="Add a description for this category"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Parent Category"
        name="ParentCategoryId"
        class="font-medium"
      >
        <USelectMenu
          v-model="selectedParent"
          :items="parentCategoryOptions"
          searchable
          placeholder="Select parent category"
          option-attribute="label"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        label="Display Order"
        name="DisplayOrder"
        class="font-medium"
      >
        <UInput
          v-model="state.DisplayOrder"
          size="xl"
          type="number"
          :min="0"
          class="w-full rounded-2xl"
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
        icon="solar:eye-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Visibility Options</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Control where and how this category appears</p>

    <div class="flex flex-wrap gap-6 mt-6">
      <UCheckbox
        v-model="state.IncludeInMenu"
        label="Include In Menu"
        name="IncludeInMenu"
      />
      <UCheckbox
        v-model="state.ShowOnHomePage"
        label="Show On Home Page"
        name="ShowOnHomePage"
      />
      <UCheckbox
        v-model="state.Published"
        label="Published"
        name="Published"
      />
    </div>
  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-[896px] p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:gallery-bold-duotone"
        width="22"
        height="22"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Images</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Upload category picture and icon</p>

    <div class="grid gap-4 sm:grid-cols-2 mt-6">
      <UFileUpload
        layout="list"
        v-model="pictureFile"
        label="Category picture"
        description="SVG, PNG, JPG or GIF (max. 5MB)"
        accept=".svg,.png,.jpg,.jpeg,.gif"
        class="w-full min-h-48"
      />

      <UFileUpload
        layout="list"
        v-model="iconFile"
        label="Category icon"
        description="SVG, PNG, JPG or GIF (max. 2MB)"
        accept=".svg,.png,.jpg,.jpeg,.gif"
        class="w-full min-h-48"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import CategoryService from '~/services/CategoryService'
  import type { CategoryDto, UpsertCategoryInfoDto } from '~/types/catalog/Category'
  import type { PagedList } from '~/types/common/PagedList'

  const state = defineModel<UpsertCategoryInfoDto>('state', { required: true })

  type ParentCategoryOption = { label: string, value: string }

  const categories = ref<PagedList<CategoryDto> | null>(null)

  onMounted(async () => {
    categories.value = await CategoryService.getCategories({ PageSize: 1000 })
  })

  const parentCategoryOptions = computed(() => {
    return categories.value?.Items?.map((c: CategoryDto): ParentCategoryOption => ({
      label: c.Name,
      value: c.Id
    })) || []
  })

  const selectedParent = computed({
    get: (): ParentCategoryOption | undefined =>
      parentCategoryOptions.value.find((o: ParentCategoryOption) => o.value === state.value.ParentCategoryId),
    set: (val: ParentCategoryOption | undefined) => {
      state.value.ParentCategoryId = val?.value
    }
  })

  const pictureFile = computed<File | undefined>({
    get: () => state.value.Picture?.File,
    set: (file) => {
      state.value.Picture.File = file
    }
  })

  const iconFile = computed<File | undefined>({
    get: () => state.value.Icon?.File,
    set: (file) => {
      state.value.Icon.File = file
    }
  })
</script>
