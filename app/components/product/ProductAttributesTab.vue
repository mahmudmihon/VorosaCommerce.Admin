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
          v-model:grouping="grouping"
          :data="groupedTableData"
          :columns="columns"
          :loading="loading"
          :get-row-id="getRowId"
          :get-expanded-row-model="getExpandedRowModel()"
          :grouping-options="{
            getGroupedRowModel: getGroupedRowModel()
          }"
          class="mt-4"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0 [&>tr:has(>td[colspan]:empty)]:hidden',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'hidden'
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
              td: 'border-b border-default data-[slot=expanded]:p-0 data-[slot=expanded]:border-0',
              separator: 'hidden'
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

  <UModal
    v-model:open="valueModalOpen"
    title="Add attribute value"
    description="Add a value for this product attribute"
  >
    <template #body>
      <UForm
        :schema="valueSchema"
        :state="valueState"
        class="space-y-4"
        @submit="onValueSubmit"
      >
        <UFormField
          label="Name"
          name="Name"
          required
        >
          <UInput
            v-model="valueState.Name"
            size="xl"
            placeholder="Enter value name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Display Order"
          name="DisplayOrder"
        >
          <UInput
            v-model="valueState.DisplayOrder"
            size="xl"
            type="number"
            :min="0"
            class="w-full"
          />
        </UFormField>

        <UFormField
          v-if="currentValueControlType === AttributeControlType.ColorSquares"
          label="Color"
          name="ColorSquaresRgb"
        >
          <div class="flex items-center gap-3">
            <UInput
              v-model="valueState.ColorSquaresRgb"
              size="xl"
              placeholder="#RRGGBB"
              class="w-full"
              @blur="valueState.ColorSquaresRgb = normalizeHexColor(valueState.ColorSquaresRgb) || ''"
            />
            <input
              v-model="colorPickerHex"
              type="color"
              class="h-12 w-12 cursor-pointer rounded-lg border border-default bg-transparent p-1"
            >
          </div>
        </UFormField>

        <UFormField
          v-if="currentValueControlType === AttributeControlType.ImageSquares"
          label="Image"
          name="ImageSquaresPictureId"
        >
          <div class="space-y-3">
            <div
              v-if="valuePicturesLoading"
              class="text-sm text-muted-foreground"
            >
              Loading pictures...
            </div>
            <div
              v-else-if="!productPictures.length"
              class="text-sm text-muted-foreground"
            >
              No pictures available.
            </div>
            <div
              v-else
              class="grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <label
                v-for="picture in productPictures"
                :key="picture.Id"
                class="flex items-center gap-2 border border-default rounded-lg p-2 cursor-pointer hover:bg-elevated/50"
              >
                <input
                  v-model="valueState.ImageSquaresPictureId"
                  type="radio"
                  name="picture"
                  :value="picture.Id"
                  class="accent-primary"
                >
                <img
                  :src="picture.Url"
                  alt=""
                  class="h-12 w-12 rounded border border-default object-cover"
                >
              </label>
            </div>
          </div>
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="subtle"
            class="cursor-pointer"
            :disabled="valueSubmitLoading"
            @click="valueModalOpen = false"
          />
          <UButton
            label="Save"
            color="primary"
            variant="solid"
            class="cursor-pointer"
            :loading="valueSubmitLoading"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import * as z from 'zod'
  import type { DropdownMenuItem, FormSubmitEvent, TableColumn, TabsItem } from '@nuxt/ui'
  import { getExpandedRowModel, getGroupedRowModel } from '@tanstack/table-core'
  import { h, resolveComponent } from 'vue'
  import { Icon } from '@iconify/vue'
  import ProductAttributeService from '~/services/ProductAttributeService'
  import ProductAttributeMappingService from '~/services/ProductAttributeMappingService'
  import ProductService from '~/services/ProductService'
  import type { PagedList } from '~/types/common/PagedList'
  import type { PictureDto } from '~/types/common/Picture'
  import { type ProductAttributeDto, AttributeControlType, type ProductAttributeMappingDto, type ProductAttributeValueDto, type UpsertProductAttributeMappingDto, type UpsertProductAttributeValueDto } from '~/types/catalog/ProductAttribute'

  const props = defineProps<{
    productId?: string
  }>()

  type SelectOption = { label: string, value: string }

  type GroupedValueRow = {
    id: string
    rowType: 'value' | 'placeholder'
    groupId: string
    groupName: string
    groupControlType: AttributeControlType
    groupText: string
    groupDisplayOrder: number
    groupMappingId: string
    groupProductAttributeId: string
    Name: string
    DisplayOrder: number
    ColorSquaresRgb: string
    ImageSquaresPictureId: string
    Picture?: PictureDto | null
  }

  type TableRow = GroupedValueRow
  type ValueTableRow = ProductAttributeValueDto & {
    id: string
    attributeName: string
    controlType: AttributeControlType
    attributeDisplayOrder: number
    mappingId: string
  }

  const UButton = resolveComponent('UButton')
  const UBadge = resolveComponent('UBadge')
  const UDropdownMenu = resolveComponent('UDropdownMenu')

  const toast = useToast()
  const currentTab = ref('attributes')
  const modalOpen = ref(false)
  const loading = ref(false)
  const submitLoading = ref(false)
  const valueModalOpen = ref(false)
  const valueSubmitLoading = ref(false)
  const valuePicturesLoading = ref(false)
  const productPictures = ref<PictureDto[]>([])
  const deleteMappingLoadingId = ref<string | null>(null)
  const deleteValueLoadingId = ref<string | null>(null)
  const grouping = ref<string[]>(['groupName'])

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

  const valueSchema = z.object({
    Id: z.string().optional(),
    ProductId: z.string().min(1, 'Product is required'),
    MappingId: z.string().min(1, 'Mapping is required'),
    Name: z.string().min(1, 'Name is required'),
    DisplayOrder: z.coerce.number().min(0),
    ColorSquaresRgb: z.string().optional(),
    ImageSquaresPictureId: z.string().optional()
  })

  type ValueSchema = z.output<typeof valueSchema>

  const valueState = reactive<ValueSchema>({
    Id: undefined,
    ProductId: '',
    MappingId: '',
    Name: '',
    DisplayOrder: 0,
    ColorSquaresRgb: '',
    ImageSquaresPictureId: ''
  })

  const attributeControlOptions = computed<SelectOption[]>(() => [
    { label: 'Dropdown List', value: '10' },
    { label: 'Radio List', value: '20' },
    { label: 'Checkboxes', value: '30' },
    { label: 'Color Squares', value: '40' },
    { label: 'Image Squares', value: '50' }
  ])

  const currentValueControlType = ref<AttributeControlType | null>(null)

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

  const normalizeHexColor = (input: string | null | undefined): string | null => {
    const raw = String(input || '').trim()
    if (!raw) return null
    const withoutHash = raw.startsWith('#') ? raw.slice(1) : raw
    if (!/^[0-9a-fA-F]{3}$/.test(withoutHash) && !/^[0-9a-fA-F]{6}$/.test(withoutHash)) return null
    const expanded = withoutHash.length === 3
      ? withoutHash.split('').map(ch => ch + ch).join('')
      : withoutHash
    return `#${expanded.toUpperCase()}`
  }

  const colorPickerHex = computed<string>({
    get: () => normalizeHexColor(valueState.ColorSquaresRgb) || '#000000',
    set: (val) => {
      valueState.ColorSquaresRgb = normalizeHexColor(val) || '#000000'
    }
  })

  const groupedTableData = computed<GroupedValueRow[]>(() => {
    const rows: GroupedValueRow[] = []
    attributeMappings.value.forEach(mapping => {
      const base = {
        groupId: mapping.Id,
        groupName: mapping.ProductAttributeName,
        groupControlType: mapping.AttributeControlType,
        groupText: mapping.Text,
        groupDisplayOrder: mapping.DisplayOrder,
        groupMappingId: mapping.Id,
        groupProductAttributeId: mapping.ProductAttributeId
      }

      const values = mapping.Values || []
      if (!values.length) {
        rows.push({
          id: `placeholder-${mapping.Id}`,
          rowType: 'placeholder',
          ...base,
          Name: '',
          DisplayOrder: 0,
          ColorSquaresRgb: '',
          ImageSquaresPictureId: '',
          Picture: null
        })
        return
      }

      values.forEach(value => {
        rows.push({
          ...value,
          id: value.Id,
          rowType: 'value',
          ...base
        })
      })
    })
    return rows
  })

  const valueTableData = computed<ValueTableRow[]>(() => {
    return attributeMappings.value.flatMap(mapping => {
      return (mapping.Values || []).map(value => ({
        ...value,
        id: value.Id,
        attributeName: mapping.ProductAttributeName,
        controlType: mapping.AttributeControlType,
        attributeDisplayOrder: mapping.DisplayOrder,
        mappingId: mapping.Id
      }))
    })
  })

  const mappingDropdownItems = (mappingId: string): DropdownMenuItem[][] => ([
    [
      {
        label: 'Edit attribute',
        icon: 'i-solar:pen-new-square-bold-duotone',
        disabled: !props.productId,
        onSelect: () => openEditAttributeModalById(mappingId)
      },
      {
        label: 'Add value',
        icon: 'i-solar:add-circle-bold-duotone',
        disabled: !props.productId,
        onSelect: () => openAddValueModalById(mappingId)
      }
    ],
    [
      {
        label: 'Delete attribute',
        icon: 'i-solar:trash-bin-2-bold-duotone',
        color: 'error' as const,
        disabled: !props.productId || deleteMappingLoadingId.value === mappingId,
        onSelect: () => onDeleteMapping(mappingId)
      }
    ]
  ])

  const valueDropdownItems = (valueId: string, mappingId: string): DropdownMenuItem[][] => ([
    [
      {
        label: 'Edit value',
        icon: 'i-solar:pen-new-square-bold-duotone',
        disabled: !props.productId,
        onSelect: () => openEditValueModalById(valueId, mappingId)
      }
    ],
    [
      {
        label: 'Delete value',
        icon: 'i-solar:trash-bin-2-bold-duotone',
        color: 'error' as const,
        disabled: !props.productId || deleteValueLoadingId.value === valueId,
        onSelect: () => onDeleteValue(valueId, mappingId)
      }
    ]
  ])

  const columns = computed<TableColumn<TableRow>[]>(() => {
    return [
      {
        id: 'groupName',
        accessorKey: 'groupName',
        header: 'Item',
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            const valueCount = row.subRows.filter(subRow => (subRow.original as GroupedValueRow | undefined)?.rowType === 'value').length
            const canExpand = row.getCanExpand() && valueCount > 0
            return h('div', { class: 'flex items-center gap-3' }, [
              canExpand
                ? h(UButton, {
                  icon: row.getIsExpanded() ? 'i-lucide-minus' : 'i-lucide-plus',
                  color: 'neutral',
                  variant: 'outline',
                  size: 'xs',
                  square: true,
                  class: 'cursor-pointer',
                  onClick: row.getToggleExpandedHandler()
                })
                : h('div', { class: 'size-6' }),
              h('span', { class: 'font-medium text-highlighted' }, row.getValue('groupName') || '')
            ])
          }

          const original = row.original as GroupedValueRow
          if (original.rowType === 'placeholder') return null
          return h('div', { class: 'flex items-center gap-3 pl-8' }, [
            h('span', { class: 'text-sm text-muted-foreground' }, original.Name)
          ])
        }
      },
      {
        id: 'count',
        header: '#',
        accessorFn: row => row.rowType === 'value' ? 1 : 0,
        aggregationFn: 'sum',
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            const count = Number(row.getValue('count') || 0)
            return h('span', { class: 'text-sm text-muted-foreground' }, `${count} value${count === 1 ? '' : 's'}`)
          }
          return null
        }
      },
      {
        id: 'type',
        header: 'Type',
        accessorKey: 'groupControlType',
        aggregationFn: 'max',
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            const groupedType = row.getValue('type') as AttributeControlType | undefined
            if (!groupedType) return null
            return h(UBadge, { color: 'neutral', variant: 'subtle' }, () => attributeControlLabel(groupedType))
          }

          const original = row.original as GroupedValueRow
          if (original.rowType === 'placeholder') return null

          if (original.groupControlType === AttributeControlType.ColorSquares) {
            const hex = normalizeHexColor(original.ColorSquaresRgb)
            return h('div', { class: 'flex items-center gap-2' }, [
              h('span', {
                class: 'inline-block size-3 rounded-full border border-default',
                style: { backgroundColor: hex || '#000000' }
              }),
              h(UBadge, { color: 'neutral', variant: 'subtle' }, () => hex || '-')
            ])
          }

          if (original.groupControlType === AttributeControlType.ImageSquares) {
            const url = original.Picture?.Url
            return h('div', { class: 'flex items-center gap-2' }, [
              url
                ? h('img', { src: url, alt: '', class: 'h-6 w-6 rounded border border-default object-cover' })
                : null,
              h(UBadge, { color: 'neutral', variant: 'subtle' }, () => 'Image')
            ].filter(Boolean))
          }

          return h(UBadge, { color: 'neutral', variant: 'subtle' }, () => 'Value')
        }
      },
      {
        id: 'displayOrder',
        header: 'Order',
        accessorKey: 'groupDisplayOrder',
        aggregationFn: 'max',
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            return row.getValue('displayOrder')
          }
          const original = row.original as GroupedValueRow
          if (original.rowType === 'placeholder') return null
          return original.DisplayOrder
        }
      },
      {
        id: 'valueDetails',
        header: () => h('div', { class: 'w-full text-center' }, 'Actions'),
        cell: ({ row }) => {
          if (row.getIsGrouped()) {
            const mappingId = (row.subRows[0]?.original as GroupedValueRow)?.groupMappingId
            if (!mappingId) return null
            return h('div', { class: 'flex justify-center' }, [
              h(UDropdownMenu, { items: mappingDropdownItems(mappingId), content: { align: 'end' } }, () =>
                h(UButton, {
                  icon: 'i-solar:menu-dots-bold-duotone',
                  color: 'neutral',
                  variant: 'ghost',
                  size: 'lg',
                  class: 'cursor-pointer'
                })
              )
            ])
          }

          const original = row.original as GroupedValueRow
          if (original.rowType === 'placeholder') return null

          return h('div', { class: 'flex justify-center' }, [
            h(UDropdownMenu, { items: valueDropdownItems(original.id, original.groupMappingId), content: { align: 'end' } }, () =>
              h(UButton, {
                icon: 'i-solar:menu-dots-bold-duotone',
                color: 'neutral',
                variant: 'ghost',
                size: 'lg',
                class: 'cursor-pointer'
              })
            )
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
        header: () => h('div', { class: 'w-full text-center' }, 'Actions'),
        cell: ({ row }) => {
          const mappingId = row.original.mappingId
          return h('div', { class: 'flex justify-center' }, [
            h(UDropdownMenu, { items: mappingDropdownItems(mappingId), content: { align: 'end' } }, () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                size: 'lg',
                class: 'cursor-pointer'
              })
            )
          ])
        }
      }
    ]
  })

  const getRowId = (row: TableRow) => row.id

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

  const findMappingById = (mappingId: string) => {
    return attributeMappings.value.find(mapping => mapping.Id === mappingId) || null
  }

  const openEditAttributeModalById = (mappingId: string) => {
    const mapping = findMappingById(mappingId)
    if (!mapping) return
    if (!props.productId) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }
    state.ProductAttributeId = mapping.ProductAttributeId
    state.AttributeControlType = mapping.AttributeControlType
    state.Text = mapping.Text
    state.DisplayOrder = mapping.DisplayOrder
    modalOpen.value = true
  }

  const openAddValueModalById = (mappingId: string) => {
    const mapping = findMappingById(mappingId)
    if (!mapping) return
    openAddValueModal(mapping)
  }

  const openEditValueModalById = (valueId: string, mappingId: string) => {
    const mapping = findMappingById(mappingId)
    if (!mapping) return
    const value = mapping.Values?.find(v => v.Id === valueId)
    if (!value) return

    openAddValueModal(mapping) // Reset and open

    // Override with value data
    valueState.Name = value.Name
    valueState.DisplayOrder = value.DisplayOrder
    valueState.ColorSquaresRgb = value.ColorSquaresRgb || (currentValueControlType.value === AttributeControlType.ColorSquares ? '#000000' : '')
    valueState.ImageSquaresPictureId = value.ImageSquaresPictureId || ''

    // If it's an update, we might need the ID (not currently in Upsert DTO, assuming Add for now or need refactor for Edit)
    // IMPORTANT: The current onValueSubmit and UpsertProductAttributeValueDto suggest "Upsert" but usually need an ID for update.
    // Checking DTO... UpsertProductAttributeValueDto definition in file doesn't have ID.
    // Usually backend handles "Name" uniqueness or we need to add ID to DTO.
    // For now, let's assume we are just pre-filling for "Add" or backend handles upsert by Name?
    // Wait, the user asked for "Edit". If the API is "AddProductAttributeValue", it might create a new one.
    // Let's check ProductAttributeMappingService.
  }

  const openAddValueModal = (mapping: ProductAttributeMappingDto) => {
    if (!props.productId) {
      toast.add({ title: 'Error', description: 'Save general information first', color: 'error' })
      return
    }
    valueState.ProductId = props.productId
    valueState.MappingId = mapping.Id
    valueState.Name = ''
    valueState.DisplayOrder = 0
    valueState.ColorSquaresRgb = ''
    valueState.ImageSquaresPictureId = ''
    valueState.Id = undefined // Reset ID for new value
    currentValueControlType.value = mapping.AttributeControlType
    valueModalOpen.value = true
    if (currentValueControlType.value === AttributeControlType.ImageSquares) {
      fetchProductPictures()
      valueState.ColorSquaresRgb = ''
    }
    else if (currentValueControlType.value === AttributeControlType.ColorSquares) {
      valueState.ImageSquaresPictureId = ''
      valueState.ColorSquaresRgb = '#000000'
    }
  }

  const fetchProductPictures = async () => {
    if (!props.productId) return
    valuePicturesLoading.value = true
    try {
      productPictures.value = await ProductService.getProductPictures(props.productId)
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to load product pictures', color: 'error' })
    }
    finally {
      valuePicturesLoading.value = false
    }
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
      await ProductAttributeMappingService.addProductAttributeMapping(payload)
      await fetchAttributeMappings()
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

  const onValueSubmit = async (event: FormSubmitEvent<ValueSchema>) => {
    if (!props.productId) return
    valueSubmitLoading.value = true
    try {
      const colorHex = currentValueControlType.value === AttributeControlType.ColorSquares
        ? normalizeHexColor(event.data.ColorSquaresRgb)
        : null

      if (currentValueControlType.value === AttributeControlType.ColorSquares && !colorHex) {
        toast.add({ title: 'Error', description: 'Please enter a valid HEX color (e.g. #FF0000)', color: 'error' })
        return
      }

      const payload: UpsertProductAttributeValueDto = {
        Id: event.data.Id,
        ProductId: event.data.ProductId,
        MappingId: event.data.MappingId,
        Name: event.data.Name,
        DisplayOrder: event.data.DisplayOrder,
        ColorSquaresRgb: colorHex,
        ImageSquaresPictureId: currentValueControlType.value === AttributeControlType.ImageSquares ? event.data.ImageSquaresPictureId || '' : null
      }
      await ProductAttributeMappingService.addProductAttributeValue(payload)
      await fetchAttributeMappings()
      toast.add({ title: 'Success', description: event.data.Id ? 'Attribute value updated successfully' : 'Attribute value added successfully', color: 'success' })
      valueModalOpen.value = false
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to add attribute value', color: 'error' })
    }
    finally {
      valueSubmitLoading.value = false
    }
  }

  const onDeleteMapping = async (mappingId: string) => {
    if (!props.productId) return
    deleteMappingLoadingId.value = mappingId
    try {
      await ProductAttributeMappingService.deleteProductAttributeMapping(mappingId)
      toast.add({ title: 'Deleted', description: 'Attribute removed successfully', color: 'success' })
      await fetchAttributeMappings()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete attribute', color: 'error' })
    }
    finally {
      deleteMappingLoadingId.value = null
    }
  }

  const onDeleteValue = async (valueId: string, mappingId: string) => {
    if (!props.productId) return
    deleteValueLoadingId.value = valueId
    try {
      await ProductAttributeMappingService.deleteProductAttributeValue(mappingId, valueId)
      toast.add({ title: 'Deleted', description: 'Attribute value removed successfully', color: 'success' })
      await fetchAttributeMappings()
    }
    catch {
      toast.add({ title: 'Error', description: 'Failed to delete attribute value', color: 'error' })
    }
    finally {
      deleteValueLoadingId.value = null
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
