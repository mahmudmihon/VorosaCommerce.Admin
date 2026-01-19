<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:tag-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Product Attributes</h3>
      </div>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Manage product attributes and values</p>

    <UTabs
      v-model="currentTab"
      :items="tabItems"
      variant="link"
      class="mt-6"
    >
      <template #list-trailing>
        <div class="ml-auto flex items-center gap-3">
          <UButton
            icon="i-solar:add-circle-bold-duotone"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            :disabled="!productId"
            @click="openModal"
          >
            Add Attribute
          </UButton>
        </div>
      </template>

      <template #attributes>
        <UTable
          v-model:expanded="expanded"
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :get-row-id="getRowId"
          :get-sub-rows="getSubRows"
          :get-expanded-row-model="getExpandedRowModel()"
          class="mt-4"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }"
        />
      </template>

      <template #values>
        <div class="mt-4">
          <div
            v-if="!valueTableData.length"
            class="text-sm text-muted-foreground"
          >
            No values available.
          </div>
          <UTable
            v-else
            :data="valueTableData"
            :columns="valueColumns"
            :loading="loading"
            class="mt-2"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
              td: 'border-b border-default',
              separator: 'h-0'
            }"
          />
        </div>
      </template>
    </UTabs>
  </UCard>

  <UModal
    v-model:open="modalOpen"
    title="Add attribute"
    description="Assign a new attribute to this product"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Product Attribute"
          name="ProductAttributeId"
          required
        >
          <USelectMenu
            v-model="state.ProductAttributeId"
            :items="attributeOptions"
            searchable
            placeholder="Select attribute"
            value-key="value"
            label-key="label"
            class="w-full"
            size="xl"
          />
        </UFormField>

        <UFormField
          label="Attribute Control Type"
          name="AttributeControlType"
          required
        >
          <USelectMenu
            v-model="selectedAttributeControlType"
            :items="attributeControlOptions"
            placeholder="Select control type"
            value-key="value"
            label-key="label"
            class="w-full"
            size="xl"
          />
        </UFormField>

        <UFormField
          label="Text"
          name="Text"
        >
          <UInput
            v-model="state.Text"
            size="xl"
            placeholder="Optional text"
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
            label="Save"
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
  import type { FormSubmitEvent, TableColumn, TabsItem } from '@nuxt/ui'
  import { getExpandedRowModel } from '@tanstack/table-core'
  import { h, resolveComponent } from 'vue'
  import { Icon } from '@iconify/vue'
  import ProductAttributeService from '~/services/ProductAttributeService'
  import ProductAttributeMappingService from '~/services/ProductAttributeMappingService'
  import type { PagedList } from '~/types/common/PagedList'
  import type { ProductAttributeDto, AttributeControlType, ProductAttributeMappingDto, ProductAttributeValueDto, UpsertProductAttributeMappingDto } from '~/types/catalog/ProductAttribute'

  const props = defineProps<{
    productId?: string
  }>()

  type SelectOption = { label: string, value: string }

  type AttributeRow = ProductAttributeMappingDto & {
    id: string
    rowType: 'attribute'
    subRows?: AttributeValueRow[]
  }

  type AttributeValueRow = ProductAttributeValueDto & {
    id: string
    rowType: 'value'
    parentAttributeName: string
    parentControlType: AttributeControlType
    parentText: string
    parentDisplayOrder: number
  }

  type TableRow = AttributeRow | AttributeValueRow
  type ValueTableRow = ProductAttributeValueDto & {
    id: string
    attributeName: string
    controlType: AttributeControlType
    attributeDisplayOrder: number
  }

  const UButton = resolveComponent('UButton')
  const UBadge = resolveComponent('UBadge')

  const toast = useToast()
  const currentTab = ref('attributes')
  const modalOpen = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const expanded = ref<Record<string, boolean>>({})

  const attributeOptions = ref<SelectOption[]>([])
  const attributeMappings = ref<ProductAttributeMappingDto[]>([])

  const tabItems = ref<TabsItem[]>([
    { label: 'Attributes', slot: 'attributes', value: 'attributes' },
    { label: 'Values', slot: 'values', value: 'values' }
  ])

  const schema = z.object({
    ProductAttributeId: z.string().min(1, 'Attribute is required'),
    AttributeControlType: z.coerce.number(),
    Text: z.string().optional(),
    DisplayOrder: z.coerce.number().min(0)
  })

  type Schema = z.output<typeof schema>

  const state = reactive<Schema>({
    ProductAttributeId: '',
    AttributeControlType: 10,
    Text: '',
    DisplayOrder: 0
  })

  const attributeControlOptions = computed<SelectOption[]>(() => [
    { label: 'Dropdown List', value: '10' },
    { label: 'Radio List', value: '20' },
    { label: 'Checkboxes', value: '30' },
    { label: 'Color Squares', value: '40' },
    { label: 'Image Squares', value: '50' }
  ])

  const selectedAttributeControlType = computed<string>({
    get: () => String(state.AttributeControlType),
    set: (val) => {
      const parsed = Number(val)
      state.AttributeControlType = Number.isFinite(parsed) ? parsed : 10
    }
  })

  const attributeControlLabel = (value: AttributeControlType) => {
    const map: Record<string, string> = {
      '10': 'Dropdown List',
      '20': 'Radio List',
      '30': 'Checkboxes',
      '40': 'Color Squares',
      '50': 'Image Squares'
    }
    return map[String(value)] || String(value)
  }

  const tableData = computed<AttributeRow[]>(() => {
    return attributeMappings.value.map(mapping => ({
      ...mapping,
      id: mapping.Id,
      rowType: 'attribute',
      subRows: (mapping.Values || []).map(value => ({
        ...value,
        id: value.Id,
        rowType: 'value',
        parentAttributeName: mapping.ProductAttributeName,
        parentControlType: mapping.AttributeControlType,
        parentText: mapping.Text,
        parentDisplayOrder: mapping.DisplayOrder
      }))
    }))
  })

  const valueTableData = computed<ValueTableRow[]>(() => {
    return attributeMappings.value.flatMap(mapping => {
      return (mapping.Values || []).map(value => ({
        ...value,
        id: value.Id,
        attributeName: mapping.ProductAttributeName,
        controlType: mapping.AttributeControlType,
        attributeDisplayOrder: mapping.DisplayOrder
      }))
    })
  })

  const columns = computed<TableColumn<TableRow>[]>(() => {
    return [
      {
        id: 'expander',
        header: '',
        cell: ({ row }) => {
          if (!row.getCanExpand()) return null
          return h(UButton, {
            icon: row.getIsExpanded() ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
            color: 'neutral',
            variant: 'ghost',
            size: 'xs',
            class: 'cursor-pointer',
            onClick: row.getToggleExpandedHandler()
          })
        }
      },
      {
        id: 'name',
        header: 'Attribute / Value',
        cell: ({ row }) => {
          const original = row.original as TableRow
          if (original.rowType === 'attribute') {
            return h('div', { class: 'font-medium' }, original.ProductAttributeName)
          }
          return h('div', { class: 'pl-6 text-sm text-muted-foreground' }, original.Name)
        }
      },
      {
        id: 'controlType',
        header: 'Control Type',
        cell: ({ row }) => {
          const original = row.original as TableRow
          if (original.rowType !== 'attribute') return null
          return h(UBadge, { color: 'neutral', variant: 'subtle' }, () => attributeControlLabel(original.AttributeControlType))
        }
      },
      {
        id: 'text',
        header: 'Text',
        cell: ({ row }) => {
          const original = row.original as TableRow
          if (original.rowType !== 'attribute') return null
          return original.Text || '-'
        }
      },
      {
        id: 'displayOrder',
        header: 'Display Order',
        cell: ({ row }) => {
          const original = row.original as TableRow
          if (original.rowType === 'attribute') return original.DisplayOrder
          return original.DisplayOrder
        }
      },
      {
        id: 'valueDetails',
        header: 'Value Details',
        cell: ({ row }) => {
          const original = row.original as TableRow
          if (original.rowType !== 'value') return null
          const color = original.ColorSquaresRgb
          const imageUrl = original.Picture?.Url
          return h('div', { class: 'flex items-center gap-3' }, [
            color
              ? h('div', { class: 'h-4 w-4 rounded-full border border-default', style: { backgroundColor: color } })
              : null,
            imageUrl
              ? h('img', { src: imageUrl, class: 'h-6 w-6 rounded border border-default object-cover', alt: '' })
              : null,
            color || imageUrl ? null : h('span', { class: 'text-muted-foreground text-sm' }, '-')
          ])
        }
      }
    ]
  })

  const valueColumns = computed<TableColumn<ValueTableRow>[]>(() => {
    return [
      {
        id: 'attributeName',
        header: 'Attribute',
        cell: ({ row }) => row.original.attributeName
      },
      {
        id: 'valueName',
        header: 'Value',
        cell: ({ row }) => row.original.Name
      },
      {
        id: 'controlType',
        header: 'Control Type',
        cell: ({ row }) => h(UBadge, { color: 'neutral', variant: 'subtle' }, () => attributeControlLabel(row.original.controlType))
      },
      {
        id: 'displayOrder',
        header: 'Display Order',
        cell: ({ row }) => row.original.DisplayOrder
      },
      {
        id: 'valueDetails',
        header: 'Value Details',
        cell: ({ row }) => {
          const color = row.original.ColorSquaresRgb
          const imageUrl = row.original.Picture?.Url
          return h('div', { class: 'flex items-center gap-3' }, [
            color
              ? h('div', { class: 'h-4 w-4 rounded-full border border-default', style: { backgroundColor: color } })
              : null,
            imageUrl
              ? h('img', { src: imageUrl, class: 'h-6 w-6 rounded border border-default object-cover', alt: '' })
              : null,
            color || imageUrl ? null : h('span', { class: 'text-muted-foreground text-sm' }, '-')
          ])
        }
      }
    ]
  })

  const getRowId = (row: TableRow) => row.id
  const getSubRows = (row: TableRow) => (row as AttributeRow).subRows || []

  const fetchProductAttributes = async () => {
    try {
      const response = await ProductAttributeService.getProductAttributes({ PageSize: 1000 })
      attributeOptions.value = ((response as PagedList<ProductAttributeDto>).Items || []).map(attribute => ({
        label: attribute.Name,
        value: attribute.Id
      }))
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load product attributes', color: 'error' })
    }
  }

  const fetchAttributeMappings = async () => {
    if (!props.productId) {
      attributeMappings.value = []
      return
    }

    loading.value = true
    try {
      attributeMappings.value = await ProductAttributeMappingService.getProductAttributeMappings({
        ProductId: props.productId
      })
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load attribute mappings', color: 'error' })
    }
    finally {
      loading.value = false
    }
  }

  const openModal = () => {
    if (!props.productId) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }
    state.ProductAttributeId = ''
    state.AttributeControlType = 10
    state.Text = ''
    state.DisplayOrder = 0
    modalOpen.value = true
  }

  const onSubmit = async (event: FormSubmitEvent<Schema>) => {
    if (!props.productId) return

    submitLoading.value = true
    try {
      const payload: UpsertProductAttributeMappingDto = {
        ProductId: props.productId,
        ProductAttributeId: event.data.ProductAttributeId,
        AttributeControlType: event.data.AttributeControlType,
        Text: event.data.Text || '',
        DisplayOrder: event.data.DisplayOrder
      }
      const result = await ProductAttributeMappingService.addProductAttributeMapping(payload)
      attributeMappings.value = result
      toast.add({ title: 'Success', description: 'Attribute added successfully', color: 'success' })
      modalOpen.value = false
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to add attribute', color: 'error' })
    }
    finally {
      submitLoading.value = false
    }
  }

  watch(
    () => props.productId,
    () => {
      fetchAttributeMappings()
    },
    { immediate: true }
  )

  onMounted(() => {
    fetchProductAttributes()
  })
</script>
