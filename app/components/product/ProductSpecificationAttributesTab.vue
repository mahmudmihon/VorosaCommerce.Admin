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
    :ui="{ content: 'w-full sm:max-w-4xl' }"
    :dismissible="false"
    :modal="false"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Specification Attribute"
          name="SpecificationAttributeId"
          required
        >
          <USelectMenu
            id="SpecificationAttributeId"
            v-model="state.SpecificationAttributeId"
            :items="specificationAttributeOptions"
            searchable
            placeholder="Select specification attribute"
            value-key="value"
            label-key="label"
            class="w-full"
            size="xl"
          />
        </UFormField>

        <UFormField
          label="Value"
          name="Value"
          required
        >
          <RichEditor
            v-if="isHtmlType"
            id="Value"
            v-model="state.Value"
            :height="260"
          />
          <UInput
            v-else-if="isHyperlinkType"
            id="Value"
            v-model="state.Value"
            size="xl"
            type="url"
            placeholder="Enter URL"
            class="w-full"
          />
          <UTextarea
            v-else
            id="Value"
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
            id="DisplayOrder"
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
  import SpecificationAttributeService from '~/services/SpecificationAttributeService'
  import RichEditor from '~/components/common/RichEditor.vue'
  import { SpecificationAttributeType, type ProductSpecificationAttributeDto } from '~/types/catalog/ProductSpecificationAttribute'
  import type { SpecificationAttributeDto } from '~/types/catalog/SpecificationAttribute'

  const props = defineProps<{
    productId?: string
  }>()

  type SpecificationAttributeOption = { label: string, value: string, attributeType: SpecificationAttributeType }
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
    SpecificationAttributeId: z.string().min(1, 'Specification attribute is required'),
    Value: z.string().min(1, 'Value is required'),
    DisplayOrder: z.coerce.number().min(0)
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Schema>({
    SpecificationAttributeId: '',
    Value: '',
    DisplayOrder: 0
  })

  const editingId = ref<string | null>(null)

  const specificationAttributeOptions = ref<SpecificationAttributeOption[]>([])

  const selectedAttributeType = computed(() => {
    const selected = specificationAttributeOptions.value.find(option => option.value === state.SpecificationAttributeId)
    return selected?.attributeType ?? SpecificationAttributeType.Text
  })

  const isHtmlType = computed(() => selectedAttributeType.value === SpecificationAttributeType.HtmlText)
  const isHyperlinkType = computed(() => selectedAttributeType.value === SpecificationAttributeType.Hyperlink)

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
      Name: item.Name || item.SpecificationAttributeName || '',
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

  const fetchSpecificationAttributeOptions = async () => {
    try {
      const response = await SpecificationAttributeService.getSpecificationAttributes({
        CurrentPage: 1,
        PageSize: 1000
      })
      specificationAttributeOptions.value = (response.Items || []).map((item: SpecificationAttributeDto) => ({
        label: item.Name,
        value: item.Id,
        attributeType: item.AttributeType
      }))
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load specification attributes', color: 'error' })
    }
  }

  const resetForm = () => {
    editingId.value = null
    state.SpecificationAttributeId = ''
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
      state.SpecificationAttributeId = spec.SpecificationAttributeId
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
        await ProductService.updateProductSpecificationAttribute({
          ProductId: props.productId,
          SpecificationId: editingId.value,
          SpecificationAttributeId: event.data.SpecificationAttributeId,
          Value: event.data.Value,
          DisplayOrder: event.data.DisplayOrder
        })
        toast.add({ title: 'Success', description: 'Specification updated successfully', color: 'success' })
      }
      else {
        await ProductService.addProductSpecificationAttribute({
          ProductId: props.productId,
          SpecificationAttributeId: event.data.SpecificationAttributeId,
          Value: event.data.Value,
          DisplayOrder: event.data.DisplayOrder
        })
        toast.add({ title: 'Success', description: 'Specification added successfully', color: 'success' })
      }
      await fetchSpecifications()
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
      await ProductService.deleteProductSpecificationAttribute({
        ProductId: props.productId,
        SpecificationId: specId
      })
      await fetchSpecifications()
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

  onMounted(() => {
    fetchSpecificationAttributeOptions()
  })
</script>
