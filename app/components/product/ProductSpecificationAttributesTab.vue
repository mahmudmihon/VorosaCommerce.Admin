<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:document-add-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Specification Attributes</h3>
      </div>
      <UDropdownMenu
        :items="actionItems"
        :content="{ align: 'end' }"
        :ui="{
          item: 'cursor-pointer'
        }"
        class="cursor-pointer"
      >
        <UButton
          icon="i-solar:menu-dots-bold-duotone"
          color="success"
          variant="soft"
          class="cursor-pointer"
          :disabled="!productId"
        />
      </UDropdownMenu>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Add product specification details and display order</p>

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
    />
  </UCard>

  <UModal
    v-model:open="modalOpen"
    :title="modalTitle"
    description="Set specification details for this product"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Attribute Type"
          name="AttributeType"
          required
        >
          <USelectMenu
            v-model="selectedAttributeType"
            :items="attributeTypeOptions"
            placeholder="Select type"
            value-key="value"
            label-key="label"
            class="w-full"
            size="xl"
          />
        </UFormField>

        <UFormField
          label="Name"
          name="Name"
          required
        >
          <UInput
            v-model="state.Name"
            size="xl"
            placeholder="Enter name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Value"
          name="Value"
          required
        >
          <RichEditor
            v-if="isHtmlType"
            id="product-specification-value"
            v-model="state.Value"
            :height="260"
          />
          <UInput
            v-else-if="isHyperlinkType"
            v-model="state.Value"
            size="xl"
            type="url"
            placeholder="Enter URL"
            class="w-full"
          />
          <UTextarea
            v-else
            v-model="state.Value"
            :rows="4"
            placeholder="Enter value"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Display Order"
          name="DisplayOrder"
        >
          <UInput
            v-model="state.DisplayOrder"
            size="xl"
            type="number"
            :min="0"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            :disabled="submitLoading"
            @click="modalOpen = false"
          />
          <UButton
            :label="submitLabel"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            :loading="submitLoading"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { DropdownMenuItem, FormSubmitEvent, TableColumn } from '@nuxt/ui'
  import { h, resolveComponent } from 'vue'
  import { Icon } from '@iconify/vue'
  import ProductService from '~/services/ProductService'
  import RichEditor from '~/components/common/RichEditor.vue'
  import { SpecificationAttributeType, type ProductSpecificationAttributeDto } from '~/types/catalog/ProductSpecificationAttribute'

  const props = defineProps<{
    productId?: string
  }>()

  type SelectOption = { label: string, value: string }
  type TableRow = ProductSpecificationAttributeDto & {
    id: string
    AttributeTypeLabel: string
  }

  const UButton = resolveComponent('UButton')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const toast = useToast()
  const modalOpen = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const deleteLoadingId = ref<string | null>(null)
  const specificationAttributes = ref<ProductSpecificationAttributeDto[]>([])

  const schema = z.object({
    AttributeType: z.coerce.number(),
    Name: z.string().min(1, 'Name is required'),
    Value: z.string().min(1, 'Value is required'),
    DisplayOrder: z.coerce.number().min(0)
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Schema>({
    AttributeType: SpecificationAttributeType.Text,
    Name: '',
    Value: '',
    DisplayOrder: 0
  })

  const editingId = ref<string | null>(null)

  const attributeTypeOptions = ref<SelectOption[]>([
    { label: 'Text', value: String(SpecificationAttributeType.Text) },
    { label: 'Html Text', value: String(SpecificationAttributeType.HtmlText) },
    { label: 'Hyperlink', value: String(SpecificationAttributeType.Hyperlink) }
  ])

  const selectedAttributeType = computed<string>({
    get: () => String(state.AttributeType),
    set: (val) => {
      state.AttributeType = Number(val)
    }
  })

  const isHtmlType = computed(() => state.AttributeType === SpecificationAttributeType.HtmlText)
  const isHyperlinkType = computed(() => state.AttributeType === SpecificationAttributeType.Hyperlink)

  const modalTitle = computed(() => (editingId.value ? 'Edit specification' : 'Add specification'))
  const submitLabel = computed(() => (editingId.value ? 'Update' : 'Save'))

  const attributeTypeLabel = (type: SpecificationAttributeType) => {
    if (type === SpecificationAttributeType.HtmlText) return 'Html Text'
    if (type === SpecificationAttributeType.Hyperlink) return 'Hyperlink'
    return 'Text'
  }

  const tableData = computed<TableRow[]>(() => {
    return specificationAttributes.value.map(item => ({
      ...item,
      id: item.Id,
      AttributeTypeLabel: attributeTypeLabel(item.AttributeType)
    }))
  })

  const actionItems = computed<DropdownMenuItem[][]>(() => ([
    [
      {
        label: 'Add Specification',
        icon: 'i-solar:add-circle-bold-duotone',
        disabled: !props.productId,
        onSelect: () => openModal()
      },
      {
        label: 'Import',
        icon: 'i-solar:import-bold-duotone',
        disabled: !props.productId,
        onSelect: () => toast.add({ title: 'Import', description: 'Import is not available yet', color: 'info' })
      },
      {
        label: 'Export',
        icon: 'i-solar:export-bold-duotone',
        disabled: !props.productId,
        onSelect: () => toast.add({ title: 'Export', description: 'Export is not available yet', color: 'info' })
      }
    ]
  ]))

  const columns = computed<TableColumn<TableRow>[]>(() => {
    return [
      { accessorKey: 'Name', header: 'Name' },
      { accessorKey: 'AttributeTypeLabel', header: 'Type' },
      { accessorKey: 'Value', header: 'Value' },
      { accessorKey: 'DisplayOrder', header: 'Display Order' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) =>
          h('div', { class: 'flex items-center gap-2' }, [
            h(UButton, {
              icon: 'i-solar:pen-2-bold-duotone',
              variant: 'ghost',
              color: 'neutral',
              class: 'cursor-pointer transition-colors hover:text-primary hover:bg-primary/10',
              disabled: !props.productId,
              onClick: () => openModal(row.original)
            }),
            h(UButton, {
              icon: 'i-solar:trash-bin-2-bold-duotone',
              variant: 'ghost',
              color: 'neutral',
              class: 'cursor-pointer transition-colors hover:text-red-500 hover:bg-red-500/10',
              disabled: !props.productId,
              loading: deleteLoadingId.value === row.original.Id,
              onClick: () => onDelete(row.original.Id)
            })
          ])
      }
    ]
  })

  const fetchSpecifications = async () => {
    if (!props.productId) {
      specificationAttributes.value = []
      return
    }

    loading.value = true
    try {
      specificationAttributes.value = await ProductService.getProductSpecificationAttributes(props.productId)
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load specifications', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const resetForm = () => {
    editingId.value = null
    state.AttributeType = SpecificationAttributeType.Text
    state.Name = ''
    state.Value = ''
    state.DisplayOrder = 0
  }

  const openModal = (spec?: ProductSpecificationAttributeDto) => {
    if (!props.productId) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }

    if (spec) {
      editingId.value = spec.Id
      state.AttributeType = spec.AttributeType
      state.Name = spec.Name
      state.Value = spec.Value
      state.DisplayOrder = spec.DisplayOrder
    }
    else {
      resetForm()
    }

    modalOpen.value = true
  }

  const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    if (!props.productId) return

    submitLoading.value = true
    try {
      if (editingId.value) {
        specificationAttributes.value = await ProductService.updateProductSpecificationAttribute({
          ProductId: props.productId,
          SpecificationId: editingId.value,
          AttributeType: event.data.AttributeType,
          Name: event.data.Name,
          Value: event.data.Value,
          DisplayOrder: event.data.DisplayOrder
        })
        toast.add({ title: 'Success', description: 'Specification updated successfully', color: 'success' })
      }
      else {
        specificationAttributes.value = await ProductService.addProductSpecificationAttribute({
          ProductId: props.productId,
          AttributeType: event.data.AttributeType,
          Name: event.data.Name,
          Value: event.data.Value,
          DisplayOrder: event.data.DisplayOrder
        })
        toast.add({ title: 'Success', description: 'Specification added successfully', color: 'success' })
      }
      modalOpen.value = false
      resetForm()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to save specification', color: 'error' })
    }
    finally {
      submitLoading.value = false
    }
  }

  const onDelete = async (specId: string) => {
    if (!props.productId) return

    deleteLoadingId.value = specId
    try {
      specificationAttributes.value = await ProductService.deleteProductSpecificationAttribute({
        ProductId: props.productId,
        SpecificationId: specId
      })
      toast.add({ title: 'Deleted', description: 'Specification removed', color: 'success' })
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to remove specification', color: 'error' })
    }
    finally {
      deleteLoadingId.value = null
    }
  }

  watch(
    () => props.productId,
    () => {
      fetchSpecifications()
    },
    { immediate: true }
  )
</script>
