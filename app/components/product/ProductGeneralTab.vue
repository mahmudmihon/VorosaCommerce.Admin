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
    <p class="text-sm text-muted-foreground mt-2">Define the core details of your product</p>

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
        placeholder="Enter product name"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="SKU"
        name="Sku"
        class="font-medium"
        required
      >
        <UInput
          v-model="state.Sku"
          variant="outline"
          size="xl"
          placeholder="Enter sku"
          class="w-full rounded-2xl"
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

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Product Type"
        name="ProductType"
        class="font-medium"
      >
        <USelectMenu
          v-model="selectedProductType"
          :items="productTypeOptions"
          placeholder="Select product type"
          value-key="value"
          label-key="label"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        label="Brand"
        name="BrandId"
        class="font-medium"
      >
        <USelectMenu
          v-model="selectedBrandId"
          :items="brandOptions"
          searchable
          placeholder="Select brand"
          value-key="value"
          label-key="label"
          class="w-full"
          size="xl"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Price"
        name="Price"
        class="font-medium"
        required
      >
        <UInput
          v-model="state.Price"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          step="0.01"
          class="w-full rounded-2xl"
        />
      </UFormField>

      <UFormField
        label="Old Price"
        name="OldPrice"
        class="font-medium"
      >
        <UInput
          v-model="state.OldPrice"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          step="0.01"
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
        icon="solar:document-text-bold-duotone"
        width="22"
        height="22"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Descriptions</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Write product details and full description</p>

    <UFormField
      label="Short Description"
      name="ShortDescription"
      class="mt-6 font-medium"
    >
      <UTextarea
        v-model="state.ShortDescription"
        :rows="6"
        placeholder="Add a short description for this product"
        class="w-full rounded-2xl"
      />
    </UFormField>

    <UFormField
      label="Full Description"
      name="FullDescription"
      class="mt-4 font-medium"
    >
      <Editor
        v-model="state.FullDescription"
        placeholder="Write full description..."
        min-height-class="min-h-48"
      />
    </UFormField>
  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-[896px] p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:calendar-date-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Availability Schedule</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Set when this product becomes available and when it expires (optional)</p>

    <div class="grid gap-5 sm:grid-cols-2 mt-6">
      <UFormField
        label="Available From"
        name="AvailableStartDateTimeUtc"
        class="font-medium"
      >
        <UInput
          v-model="availableStart"
          type="date"
          icon="solar:calendar-minimalistic-bold-duotone"
          size="xl"
          placeholder="Pick a date"
          class="w-full rounded-2xl"
        />
        <template #help>
          <span class="text-muted-foreground text-xs">Leave empty for immediate availability</span>
        </template>
      </UFormField>

      <UFormField
        label="Available Until"
        name="AvailableEndDateTimeUtc"
        class="font-medium"
      >
        <UInput
          v-model="availableEnd"
          type="date"
          icon="solar:calendar-minimalistic-bold-duotone"
          size="xl"
          placeholder="No end date"
          class="w-full rounded-2xl"
        />
        <template #help>
          <span class="text-muted-foreground text-xs">Leave empty for no expiration</span>
        </template>
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
    <p class="text-sm text-muted-foreground mt-2">Control where and how this product appears</p>

    <div class="flex flex-wrap gap-6 mt-6">
      <UCheckbox
        v-model="state.Published"
        label="Published"
        name="Published"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import BrandService from '~/services/BrandService'
  import Editor from '~/components/common/Editor.vue'
  import { ProductType, type UpsertProductInfoDto } from '~/types/catalog/Product'
  import type { BrandDto } from '~/types/catalog/Brand'
  import type { PagedList } from '~/types/common/PagedList'

  const state = defineModel<UpsertProductInfoDto>('state', { required: true })

  type SelectOption = { label: string, value: string }

  const brands = ref<PagedList<BrandDto> | null>(null)

  onMounted(async () => {
    brands.value = await BrandService.getBrands({ PageSize: 1000 })
  })

  const brandOptions = computed<SelectOption[]>(() => {
    return brands.value?.Items?.map((b: BrandDto): SelectOption => ({
      label: b.Name,
      value: b.Id
    })) || []
  })

  const selectedBrandId = computed<string | undefined>({
    get: () => state.value.BrandId || undefined,
    set: (val) => {
      state.value.BrandId = val || undefined
    }
  })

  const productTypeOptions = computed<SelectOption[]>(() => [
    { label: 'Simple Product', value: String(ProductType.SimpleProduct) },
    { label: 'Grouped Product', value: String(ProductType.GroupedProduct) }
  ])

  const selectedProductType = computed<string>({
    get: () => String(state.value.ProductType),
    set: (val) => {
      const parsed = Number(val)
      state.value.ProductType = Number.isFinite(parsed) ? (parsed as ProductType) : ProductType.SimpleProduct
    }
  })

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().split('T')[0] || ''
  }

  const updateDate = (val: string, field: 'AvailableStartDateTimeUtc' | 'AvailableEndDateTimeUtc') => {
    if (!val) {
      state.value[field] = null
      return
    }
    // Append T00:00:00Z to ensure it's treated as UTC start of day
    state.value[field] = `${val}T00:00:00Z`
  }

  const availableStart = computed({
    get: () => formatDate(state.value.AvailableStartDateTimeUtc),
    set: (val) => updateDate(val, 'AvailableStartDateTimeUtc')
  })

  const availableEnd = computed({
    get: () => formatDate(state.value.AvailableEndDateTimeUtc),
    set: (val) => updateDate(val, 'AvailableEndDateTimeUtc')
  })
</script>
