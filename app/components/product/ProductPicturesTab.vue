<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:gallery-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Pictures</h3>
      </div>
      <UButton
        icon="i-solar:add-circle-bold-duotone"
        color="primary"
        variant="solid"
        class="cursor-pointer"
        :disabled="!productId"
        @click="openAddModal"
      >
        Add Picture
      </UButton>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Manage product pictures</p>

    <UTable
      :data="pictures"
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
      <template #picture-cell="{ row }">
        <img :src="row.original.Url" class="h-16 w-16 object-cover rounded border border-default" alt="Product picture">
      </template>
      <template #isDefault-cell="{ row }">
        <UBadge :color="row.original.IsDefault ? 'primary' : 'neutral'" variant="subtle">
          {{ row.original.IsDefault ? 'Yes' : 'No' }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-center">
          <UDropdownMenu :items="actions(row.original)" :content="{ align: 'end' }">
            <UButton
              icon="i-lucide-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="lg"
              class="cursor-pointer"
            />
          </UDropdownMenu>
        </div>
      </template>
    </UTable>
  </UCard>

  <UModal
    v-model:open="isModalOpen"
    :title="editingId ? 'Edit picture' : 'Add picture'"
    :description="editingId ? 'Update the picture details' : 'Upload a new picture for this product'"
  >
    <template #body>
      <UForm
        :state="formState"
        :schema="schema"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFileUpload
          v-if="!editingId"
          v-model="selectedFile"
          layout="list"
          label="Picture"
          description="SVG, PNG, JPG or GIF (max. 5MB)"
          accept=".svg,.png,.jpg,.jpeg,.gif"
          class="w-full"
        />

        <UFormField
          label="Display Order"
          name="DisplayOrder"
        >
          <UInput
            v-model="formState.DisplayOrder"
            size="xl"
            type="number"
            :min="0"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="IsDefault"
        >
          <UCheckbox
            v-model="formState.IsDefault"
            label="Is Default"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            :disabled="submitting"
            @click="isModalOpen = false"
          />
          <UButton
            label="Save"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            type="submit"
            :loading="submitting"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import * as z from 'zod'
import { h } from 'vue'
import { Icon } from '@iconify/vue'
import ProductService from '~/services/ProductService'
import type { PictureDto } from '~/types/common/Picture'

const props = defineProps<{
  productId?: string
}>()

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const pictures = ref<PictureDto[]>([])
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const selectedFile = ref<File | undefined>(undefined)

const formState = reactive({
  DisplayOrder: 0,
  IsDefault: false
})

const columns = [
  {
    id: 'picture',
    header: 'Picture'
  },
  {
    accessorKey: 'DisplayOrder',
    header: 'Display Order'
  },
  {
    accessorKey: 'IsDefault',
    header: 'Is Default',
    id: 'isDefault'
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'w-full text-center' }, 'Actions')
  }
]

const schema = z.object({
  DisplayOrder: z.coerce.number().min(0),
  IsDefault: z.boolean()
})

const validateFile = () => {
  if (!editingId.value && !selectedFile.value) {
    toast.add({ title: 'Error', description: 'Please select a picture', color: 'error' })
    return false
  }
  return true
}

const fetchPictures = async () => {
  if (!props.productId) return
  loading.value = true
  try {
    pictures.value = await ProductService.getProductPictures(props.productId)
  }
  catch {
    toast.add({ title: 'Error', description: 'Failed to load pictures', color: 'error' })
  }
  finally {
    loading.value = false
  }
}

const openAddModal = () => {
  editingId.value = null
  selectedFile.value = undefined
  formState.DisplayOrder = 0
  formState.IsDefault = false
  isModalOpen.value = true
}

const openEditModal = (picture: PictureDto) => {
  editingId.value = picture.Id
  selectedFile.value = undefined
  formState.DisplayOrder = picture.DisplayOrder
  formState.IsDefault = picture.IsDefault
  isModalOpen.value = true
}


const onSubmit = async () => {
  if (!props.productId) return
  if (!validateFile()) return

  submitting.value = true
  try {
    if (editingId.value) {
      await ProductService.updateProductPicture(props.productId, editingId.value, {
        ProductId: props.productId,
        PictureId: editingId.value,
        DisplayOrder: formState.DisplayOrder,
        IsDefault: formState.IsDefault
      })
      toast.add({ title: 'Success', description: 'Picture updated successfully', color: 'success' })
    }
    else {
      const formData = new FormData()
      formData.append('ProductId', props.productId)
      if (selectedFile.value) {
        formData.append('File', selectedFile.value)
      }
      formData.append('DisplayOrder', formState.DisplayOrder.toString())
      formData.append('IsDefault', formState.IsDefault.toString())

      await ProductService.addProductPicture(props.productId, formData)
      toast.add({ title: 'Success', description: 'Picture added successfully', color: 'success' })
    }
    isModalOpen.value = false
    await fetchPictures()
  }
  catch {
    toast.add({ title: 'Error', description: 'Failed to save picture', color: 'error' })
  }
  finally {
    submitting.value = false
  }
}

const onDelete = async (picture: PictureDto) => {
  if (!props.productId) return
  if (!confirm('Are you sure you want to delete this picture?')) return

  try {
    await ProductService.deleteProductPicture(props.productId, picture.Id)
    toast.add({ title: 'Success', description: 'Picture deleted successfully', color: 'success' })
    await fetchPictures()
  }
  catch {
    toast.add({ title: 'Error', description: 'Failed to delete picture', color: 'error' })
  }
}

const actions = (row: PictureDto) => [
  [
    {
      label: 'Edit',
      icon: 'i-solar:pen-new-square-bold-duotone',
      onSelect: () => openEditModal(row)
    }
  ],
  [
    {
      label: 'Delete',
      icon: 'i-solar:trash-bin-2-bold-duotone',
      color: 'error',
      onSelect: () => onDelete(row)
    }
  ]
]

onMounted(() => {
  fetchPictures()
})
</script>
