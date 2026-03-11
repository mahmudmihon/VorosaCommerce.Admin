<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:heart-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Loved Brands</h3>
      </div>
      <UButton
        icon="i-solar:add-circle-bold-duotone"
        color="primary"
        variant="soft"
        class="cursor-pointer rounded-lg px-3"
        @click="openAddModal"
      >
        Add Brand
      </UButton>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Manage loved brands shown on the homepage</p>

    <UTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      class="mt-6"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0'
      }"
    >
      <template #LogoUrl-cell="{ row }">
        <img
          v-if="row.original.LogoUrl"
          :src="row.original.LogoUrl"
          alt="Brand logo"
          class="h-12 w-12 rounded border border-default object-contain bg-white"
        >
      </template>
    </UTable>

    <UModal v-model:open="modalOpen" :title="modalTitle" :ui="{ content: 'w-full sm:max-w-3xl' }">
      <template #body>
        <UForm
          :schema="schema"
          :state="formState"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField label="Name" name="Name" required>
            <UInput
              v-model="formState.Name"
              placeholder="Enter brand name"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Url" name="Url" required>
            <UInput
              v-model="formState.Url"
              placeholder="https://example.com"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Display Order" name="DisplayOrder">
            <UInput
              v-model="formState.DisplayOrder"
              type="number"
              :min="0"
              class="w-full"
            />
          </UFormField>

          <div v-if="logoPreviewUrl" class="relative rounded-2xl border border-default bg-elevated/25 p-3">
            <UButton
              type="button"
              icon="i-solar:trash-bin-minimalistic-bold-duotone"
              color="error"
              variant="ghost"
              size="md"
              square
              class="absolute right-2 top-2 z-10 cursor-pointer"
              aria-label="Remove logo"
              @click="onRemoveLogo"
            />
            <img :src="logoPreviewUrl" alt="Brand logo" class="h-20 w-auto object-contain">
          </div>

          <UFileUpload
            v-else
            v-model="logoFile"
            layout="list"
            label="Logo"
            description="SVG, PNG, JPG or GIF (max. 5MB)"
            accept=".svg,.png,.jpg,.jpeg,.gif"
            class="w-full"
          />

          <div class="flex justify-end gap-2 pt-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="subtle"
              class="cursor-pointer rounded-lg px-3"
              :disabled="saving"
              @click="modalOpen = false"
            />
            <UButton
              type="submit"
              label="Save"
              color="primary"
              variant="solid"
              class="cursor-pointer rounded-lg px-3"
              :loading="saving"
            />
          </div>
        </UForm>
      </template>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { Icon } from '@iconify/vue'
import LovedBrandService from '~/services/LovedBrandService'
import type { LovedBrandDto, UpsertLovedBrandDto } from '~/types/homepagetemplate/LovedBrand'

type LovedBrandRow = LovedBrandDto & { id: string }

const props = defineProps<{
  templateId: string
}>()

const toast = useToast()
const UButton = resolveComponent('UButton')

const lovedBrands = ref<LovedBrandDto[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const saving = ref(false)
const deleteLoadingId = ref<string | null>(null)
const editingBrand = ref<LovedBrandDto | null>(null)
const logoFile = ref<File | undefined>(undefined)
const logoPreviewUrl = ref<string | null>(null)

const formState = reactive<UpsertLovedBrandDto>({
  Id: undefined,
  TemplateId: props.templateId,
  Name: '',
  Url: '',
  DisplayOrder: 0,
  Logo: null
})

const schema = z.object({
  Name: z.string().min(1, 'Name is required'),
  Url: z.string().min(1, 'Url is required'),
  DisplayOrder: z.coerce.number().min(0)
})

const modalTitle = computed(() => (editingBrand.value ? 'Edit Loved Brand' : 'Add Loved Brand'))

const tableData = computed<LovedBrandRow[]>(() => {
  return lovedBrands.value.map(item => ({ ...item, id: item.Id }))
})

const columns = computed<TableColumn<LovedBrandRow>[]>(() => ([
  { accessorKey: 'Name', header: 'Name' },
  { accessorKey: 'LogoUrl', header: 'Logo' },
  { accessorKey: 'Url', header: 'Url' },
  { accessorKey: 'DisplayOrder', header: 'Display Order' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center gap-2' }, [
        h(UButton, {
          icon: 'i-solar:pen-new-square-bold-duotone',
          variant: 'ghost',
          color: 'neutral',
          class: 'cursor-pointer transition-colors hover:text-secondary hover:bg-secondary/10',
          onClick: () => openEditModal(row.original)
        }),
        h(UButton, {
          icon: 'i-solar:trash-bin-2-bold-duotone',
          variant: 'ghost',
          color: 'neutral',
          class: 'cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10',
          loading: deleteLoadingId.value === row.original.Id,
          disabled: deleteLoadingId.value === row.original.Id,
          onClick: () => onDelete(row.original.Id)
        })
      ])
  }
]))

const fetchLovedBrands = async () => {
  if (!props.templateId) return
  loading.value = true
  try {
    lovedBrands.value = await LovedBrandService.getLovedBrands(props.templateId)
  }
  catch (error) {
    console.error('Failed to fetch loved brands', error)
    toast.add({ title: 'Error', description: 'Failed to load loved brands', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

const resetForm = () => {
  formState.Id = undefined
  formState.TemplateId = props.templateId
  formState.Name = ''
  formState.Url = ''
  formState.DisplayOrder = 0
  formState.Logo = null
  logoFile.value = undefined
  logoPreviewUrl.value = null
  editingBrand.value = null
}

const openAddModal = () => {
  resetForm()
  modalOpen.value = true
}

const openEditModal = (brand: LovedBrandDto) => {
  resetForm()
  editingBrand.value = brand
  formState.Id = brand.Id
  formState.TemplateId = props.templateId
  formState.Name = brand.Name
  formState.Url = brand.Url
  formState.DisplayOrder = brand.DisplayOrder
  logoPreviewUrl.value = brand.LogoUrl
  modalOpen.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    const payload: UpsertLovedBrandDto = {
      Id: formState.Id,
      TemplateId: formState.TemplateId,
      Name: formState.Name,
      Url: formState.Url,
      DisplayOrder: Number(formState.DisplayOrder),
      Logo: logoFile.value || null
    }
    await LovedBrandService.upsertLovedBrand(payload)
    toast.add({ title: 'Success', description: 'Loved brand saved successfully', color: 'success' })
    modalOpen.value = false
    await fetchLovedBrands()
  }
  catch (error) {
    console.error('Failed to save loved brand', error)
    toast.add({ title: 'Error', description: 'Failed to save loved brand', color: 'error' })
  }
  finally {
    saving.value = false
  }
}

const onRemoveLogo = () => {
  logoPreviewUrl.value = null
  logoFile.value = undefined
}

const onDelete = async (id: string) => {
  if (!id || deleteLoadingId.value) return
  deleteLoadingId.value = id
  try {
    await LovedBrandService.deleteLovedBrand(id)
    toast.add({ title: 'Success', description: 'Loved brand deleted successfully', color: 'success' })
    await fetchLovedBrands()
  }
  catch (error) {
    console.error('Failed to delete loved brand', error)
    toast.add({ title: 'Error', description: 'Failed to delete loved brand', color: 'error' })
  }
  finally {
    deleteLoadingId.value = null
  }
}

onMounted(() => {
  fetchLovedBrands()
})

watch(
  () => props.templateId,
  () => {
    fetchLovedBrands()
  }
)
</script>
