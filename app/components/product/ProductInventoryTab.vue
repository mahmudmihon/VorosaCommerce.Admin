<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:box-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Inventory</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Manage stock levels and inventory behavior</p>

    <div class="grid gap-5 sm:grid-cols-2 mt-6">
      <UFormField
        label="Manage Inventory Method"
        name="ManageInventoryMethod"
        class="font-medium"
      >
        <USelectMenu
          v-model="selectedManageInventoryMethod"
          :items="manageInventoryOptions"
          placeholder="Select inventory method"
          value-key="value"
          label-key="label"
          class="w-full"
          size="xl"
        />
      </UFormField>

      <UFormField
        label="Low Stock Activity"
        name="LowStockActivity"
        class="font-medium"
      >
        <USelectMenu
          v-model="selectedLowStockActivity"
          :items="lowStockOptions"
          placeholder="Select low stock action"
          value-key="value"
          label-key="label"
          class="w-full"
          size="xl"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Stock Quantity"
        name="StockQuantity"
        class="font-medium"
      >
        <UInput
          v-model="state.StockQuantity"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          class="w-full rounded-2xl"
        />
      </UFormField>

      <UFormField
        label="Reserved Quantity"
        name="ReservedQuantity"
        class="font-medium"
      >
        <UInput
          v-model="state.ReservedQuantity"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          class="w-full rounded-2xl"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Notify Admin for Quantity Below"
        name="NotifyAdminForQuantityBelow"
        class="font-medium"
      >
        <UInput
          v-model="state.NotifyAdminForQuantityBelow"
          variant="outline"
          size="xl"
          type="number"
          :min="isNotifyAdminSelected ? 1 : 0"
          class="w-full rounded-2xl"
        />
      </UFormField>

      <UFormField
        label="Order Minimum Quantity"
        name="OrderMinimumQuantity"
        class="font-medium"
      >
        <UInput
          v-model="state.OrderMinimumQuantity"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          class="w-full rounded-2xl"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 sm:grid-cols-2 mt-4">
      <UFormField
        label="Order Maximum Quantity"
        name="OrderMaximumQuantity"
        class="font-medium"
      >
        <UInput
          v-model="state.OrderMaximumQuantity"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          class="w-full rounded-2xl"
        />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { LowStockActivity, ManageInventoryMethod, type UpsertProductInventoryDto } from '~/types/catalog/Product'

  const state = defineModel<UpsertProductInventoryDto>('state', { required: true })

  type SelectOption = { label: string, value: string }

  const manageInventoryOptions = computed<SelectOption[]>(() => [
    { label: 'Do not manage stock', value: String(ManageInventoryMethod.DontManageStock) },
    { label: 'Manage stock', value: String(ManageInventoryMethod.ManageStock) },
    { label: 'Manage stock by attributes', value: String(ManageInventoryMethod.ManageStockByAttributes) }
  ])

  const lowStockOptions = computed<SelectOption[]>(() => [
    { label: 'Do nothing', value: String(LowStockActivity.Nothing) },
    { label: 'Notify admin', value: String(LowStockActivity.NotifyAdmin) },
    { label: 'Unpublish product', value: String(LowStockActivity.Unpublish) },
    { label: 'Mark as out of stock', value: String(LowStockActivity.MarkAsOutOfStock) }
  ])

  const selectedManageInventoryMethod = computed<string>({
    get: () => String(state.value.ManageInventoryMethod),
    set: (val) => {
      const parsed = Number(val)
      state.value.ManageInventoryMethod = Number.isFinite(parsed)
        ? (parsed as ManageInventoryMethod)
        : ManageInventoryMethod.DontManageStock
    }
  })

  const selectedLowStockActivity = computed<string>({
    get: () => String(state.value.LowStockActivity),
    set: (val) => {
      const parsed = Number(val)
      state.value.LowStockActivity = Number.isFinite(parsed)
        ? (parsed as LowStockActivity)
        : LowStockActivity.Nothing
    }
  })

  const isNotifyAdminSelected = computed(() => {
    return state.value.LowStockActivity === LowStockActivity.NotifyAdmin
  })

  watch(isNotifyAdminSelected, (enabled) => {
    if (enabled && state.value.NotifyAdminForQuantityBelow < 1) {
      state.value.NotifyAdminForQuantityBelow = 1
    }
    
    if (!enabled && state.value.NotifyAdminForQuantityBelow !== 0) {
      state.value.NotifyAdminForQuantityBelow = 0
    }
  }, { immediate: true })
</script>
