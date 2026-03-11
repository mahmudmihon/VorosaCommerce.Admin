<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:star-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">USP</h3>
      </div>
      <UButton
        icon="i-solar:add-circle-bold-duotone"
        color="primary"
        variant="soft"
        class="cursor-pointer rounded-lg px-3"
        @click="openAddModal"
      >
        Add USP
      </UButton>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Manage unique selling points shown on the homepage</p>

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
      <template #ImageUrl-cell="{ row }">
        <img
          v-if="row.original.ImageUrl"
          :src="row.original.ImageUrl"
          alt="USP image"
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
          <UFormField label="Title" name="Title" required>
            <UInput
              v-model="formState.Title"
              placeholder="Enter title"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description" name="Description" required>
            <UTextarea
              v-model="formState.Description"
              :rows="4"
              placeholder="Enter description"
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

          <div v-if="imagePreviewUrl" class="relative rounded-2xl border border-default bg-elevated/25 p-3">
            <UButton
              type="button"
              icon="i-solar:trash-bin-minimalistic-bold-duotone"
              color="error"
              variant="ghost"
              size="md"
              square
              class="absolute right-2 top-2 z-10 cursor-pointer"
              aria-label="Remove image"
              @click="onRemoveImage"
            />
            <img :src="imagePreviewUrl" alt="USP image" class="h-20 w-auto object-contain">
          </div>

          <UFileUpload
            v-else
            v-model="imageFile"
            layout="list"
            label="Image"
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
import USPService from '~/services/USPService'
import type { UpsertUSPDto, USPDto } from '~/types/homepagetemplate/USP'

type USPRow = USPDto & { id: string }

const props = defineProps<{
  templateId: string
}>()

const toast = useToast()
const UButton = resolveComponent('UButton')

const usps = ref<USPDto[]>([])
const loading = ref(false)
const modalOpen = ref(false)
const saving = ref(false)
const deleteLoadingId = ref<string | null>(null)
const editingUsp = ref<USPDto | null>(null)
const imageFile = ref<File | undefined>(undefined)
const imagePreviewUrl = ref<string | null>(null)

const formState = reactive<UpsertUSPDto>({
  Id: undefined,
  TemplateId: props.templateId,
  Title: '',
  Description: '',
  DisplayOrder: 0,
  Image: null
})

const schema = z.object({
  Title: z.string().min(1, 'Title is required'),
  Description: z.string().min(1, 'Description is required'),
  DisplayOrder: z.coerce.number().min(0)
})

const modalTitle = computed(() => (editingUsp.value ? 'Edit USP' : 'Add USP'))

const tableData = computed<USPRow[]>(() => {
  return usps.value.map(item => ({ ...item, id: item.Id }))
})

const columns = computed<TableColumn<USPRow>[]>(() => ([
  { accessorKey: 'Title', header: 'Title' },
  { accessorKey: 'Description', header: 'Description' },
  { accessorKey: 'ImageUrl', header: 'Image' },
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

const fetchUsps = async () => {
  if (!props.templateId) return
  loading.value = true
  try {
    usps.value = await USPService.getUsps(props.templateId)
  }
  catch (error) {
    console.error('Failed to fetch USPs', error)
    toast.add({ title: 'Error', description: 'Failed to load USPs', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

const resetForm = () => {
  formState.Id = undefined
  formState.TemplateId = props.templateId
  formState.Title = ''
  formState.Description = ''
  formState.DisplayOrder = 0
  formState.Image = null
  imageFile.value = undefined
  imagePreviewUrl.value = null
  editingUsp.value = null
}

const openAddModal = () => {
  resetForm()
  modalOpen.value = true
}

const openEditModal = (usp: USPDto) => {
  resetForm()
  editingUsp.value = usp
  formState.Id = usp.Id
  formState.TemplateId = props.templateId
  formState.Title = usp.Title
  formState.Description = usp.Description
  formState.DisplayOrder = usp.DisplayOrder
  imagePreviewUrl.value = usp.ImageUrl
  modalOpen.value = true
}

const onSubmit = async () => {
  saving.value = true
  try {
    const payload: UpsertUSPDto = {
      Id: formState.Id,
      TemplateId: formState.TemplateId,
      Title: formState.Title,
      Description: formState.Description,
      DisplayOrder: Number(formState.DisplayOrder),
      Image: imageFile.value || null
    }
    await USPService.upsertUsp(payload)
    toast.add({ title: 'Success', description: 'USP saved successfully', color: 'success' })
    modalOpen.value = false
    await fetchUsps()
  }
  catch (error) {
    console.error('Failed to save USP', error)
    toast.add({ title: 'Error', description: 'Failed to save USP', color: 'error' })
  }
  finally {
    saving.value = false
  }
}

const onRemoveImage = () => {
  imagePreviewUrl.value = null
  imageFile.value = undefined
}

const onDelete = async (id: string) => {
  if (!id || deleteLoadingId.value) return
  deleteLoadingId.value = id
  try {
    await USPService.deleteUsp(id)
    toast.add({ title: 'Success', description: 'USP deleted successfully', color: 'success' })
    await fetchUsps()
  }
  catch (error) {
    console.error('Failed to delete USP', error)
    toast.add({ title: 'Error', description: 'Failed to delete USP', color: 'error' })
  }
  finally {
    deleteLoadingId.value = null
  }
}

onMounted(() => {
  fetchUsps()
})

watch(
  () => props.templateId,
  () => {
    fetchUsps()
  }
)
</script>
