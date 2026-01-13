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
          v-model="selectedParentId"
          :items="parentCategoryOptions"
          searchable
          placeholder="Select parent category"
          value-key="value"
          label-key="label"
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
      <div class="flex flex-col gap-3">
        <div
          v-if="picturePreviewUrl"
          class="relative flex flex-col gap-3 rounded-2xl border border-default bg-elevated/25 p-3 min-h-48"
        >
          <UButton
            type="button"
            icon="i-solar:trash-bin-minimalistic-bold-duotone"
            color="error"
            variant="ghost"
            size="md"
            square
            class="absolute right-2 top-2 z-100"
            aria-label="Remove picture"
            @click="removePicture"
          />
          <div class="flex-1 flex items-center justify-center">
            <img
              :src="picturePreviewUrl"
              alt="Category picture"
              class="max-h-44 w-auto object-contain"
            >
          </div>
        </div>

        <UFileUpload
          v-else
          v-model="pictureFile"
          layout="list"
          label="Category picture"
          description="SVG, PNG, JPG or GIF (max. 5MB)"
          accept=".svg,.png,.jpg,.jpeg,.gif"
          class="w-full min-h-48"
        />
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-if="iconPreviewUrl"
          class="relative flex flex-col gap-3 rounded-2xl border border-default bg-elevated/25 p-3 min-h-48"
        >
          <UButton
            type="button"
            icon="i-solar:trash-bin-minimalistic-bold-duotone"
            color="error"
            variant="ghost"
            size="md"
            square
            class="absolute right-2 top-2 z-100"
            aria-label="Remove icon"
            @click="removeIcon"
          />
          <div class="flex-1 flex items-center justify-center">
            <img
              :src="iconPreviewUrl"
              alt="Category icon"
              class="max-h-44 w-auto object-contain"
            >
          </div>
        </div>

        <UFileUpload
          v-else
          v-model="iconFile"
          layout="list"
          label="Category icon"
          description="SVG, PNG, JPG or GIF (max. 2MB)"
          accept=".svg,.png,.jpg,.jpeg,.gif"
          class="w-full min-h-48"
        />
      </div>
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

  const selectedParentId = computed<string | undefined>({
    get: () => state.value.ParentCategoryId || undefined,
    set: (val) => {
      state.value.ParentCategoryId = val || undefined
    }
  })

  const pictureFile = computed<File | undefined>({
    get: () => state.value.Picture?.File,
    set: (file) => {
      if (!state.value.Picture) state.value.Picture = {}
      state.value.Picture.File = file
    }
  })

  const iconFile = computed<File | undefined>({
    get: () => state.value.Icon?.File,
    set: (file) => {
      if (!state.value.Icon) state.value.Icon = {}
      state.value.Icon.File = file
    }
  })

  const pictureObjectUrl = ref<string | undefined>(undefined)
  const iconObjectUrl = ref<string | undefined>(undefined)

  watch(pictureFile, (file) => {
    if (pictureObjectUrl.value) URL.revokeObjectURL(pictureObjectUrl.value)
    pictureObjectUrl.value = file ? URL.createObjectURL(file) : undefined
  })

  watch(iconFile, (file) => {
    if (iconObjectUrl.value) URL.revokeObjectURL(iconObjectUrl.value)
    iconObjectUrl.value = file ? URL.createObjectURL(file) : undefined
  })

  onBeforeUnmount(() => {
    if (pictureObjectUrl.value) URL.revokeObjectURL(pictureObjectUrl.value)
    if (iconObjectUrl.value) URL.revokeObjectURL(iconObjectUrl.value)
  })

  const picturePreviewUrl = computed(() => pictureObjectUrl.value || state.value.Picture?.Url)
  const iconPreviewUrl = computed(() => iconObjectUrl.value || state.value.Icon?.Url)

  const removePicture = () => {
    if (!state.value.Picture) state.value.Picture = {}
    state.value.Picture.File = undefined
    state.value.Picture.PictureId = undefined
    state.value.Picture.Url = undefined
  }

  const removeIcon = () => {
    if (!state.value.Icon) state.value.Icon = {}
    state.value.Icon.File = undefined
    state.value.Icon.PictureId = undefined
    state.value.Icon.Url = undefined
  }
</script>
