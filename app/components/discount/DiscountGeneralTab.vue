<template>
  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:ticket-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Basic Information</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Define the discount identity and application scope</p>

    <div class="grid gap-5 mt-6">
      <UFormField
        label="Discount Name"
        name="Name"
        class="font-medium"
        required
      >
        <UInput
          v-model="state.Name"
          variant="outline"
          size="xl"
          placeholder="e.g., Summer Sale 20% Off"
          class="w-full rounded-2xl"
        />
        <template #help>
          <span class="text-muted-foreground text-xs">Give your discount a descriptive name for easy identification</span>
        </template>
      </UFormField>
    </div>

    <div class="mt-6">
      <p class="text-sm font-medium text-default">Discount Type</p>
      <div class="grid gap-4 sm:grid-cols-2 mt-3">
        <button
          v-for="option in discountTypeCards"
          :key="option.value"
          type="button"
          class="flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer"
          :class="selectedDiscountType === String(option.value)
            ? 'border-primary ring-1 ring-primary/30 bg-primary/5 text-primary'
            : 'border-default hover:border-primary/40 hover:bg-primary/5'"
          @click="selectedDiscountType = String(option.value)"
        >
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-muted"
            :class="selectedDiscountType === String(option.value) ? 'bg-primary/10 text-primary' : ''"
          >
            <Icon :icon="option.icon" width="30" height="30" />
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-default">{{ option.label }}</span>
            <span class="text-xs text-muted-foreground">{{ option.description }}</span>
          </span>
        </button>
      </div>
    </div>

  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:tag-price-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Discount Value</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Set the discount method and value</p>

    <div class="mt-6">
      <p class="text-sm font-medium text-default">Discount Method</p>
      <div class="grid gap-4 sm:grid-cols-2 mt-3">
        <button
          type="button"
          class="flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer"
          :class="usePercentage
            ? 'border-primary ring-1 ring-primary/30 bg-primary/5 text-primary'
            : 'border-default hover:border-primary/40 hover:bg-primary/5'"
          @click="usePercentage = true"
        >
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"
            :class="usePercentage ? 'bg-primary/10 text-primary' : ''"
          >
            <Icon icon="solar:sale-square-bold-duotone" width="20" height="20" />
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-default">Percentage</span>
            <span class="text-xs text-muted-foreground">Discount by %</span>
          </span>
        </button>

        <button
          type="button"
          class="flex items-center gap-3 rounded-2xl border p-4 text-left transition cursor-pointer"
          :class="!usePercentage
            ? 'border-primary ring-1 ring-primary/30 bg-primary/5 text-primary'
            : 'border-default hover:border-primary/40 hover:bg-primary/5'"
          @click="usePercentage = false"
        >
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"
            :class="!usePercentage ? 'bg-primary/10 text-primary' : ''"
          >
            <Icon icon="solar:dollar-bold-duotone" width="20" height="20" />
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-default">Fixed Amount</span>
            <span class="text-xs text-muted-foreground">Discount by $</span>
          </span>
        </button>
      </div>
    </div>

    <div v-if="usePercentage" class="grid gap-5 sm:grid-cols-2 mt-6">
      <UFormField
        label="Discount Percentage"
        name="DiscountPercentage"
        class="font-medium"
      >
        <UInput
          v-model="state.DiscountPercentage"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          step="0.01"
          placeholder="0"
          class="w-full rounded-2xl"
        />
      </UFormField>

      <UFormField
        label="Maximum Discount"
        name="MaximumDiscountAmount"
        class="font-medium"
      >
        <UInput
          v-model="state.MaximumDiscountAmount"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          step="0.01"
          placeholder="No limit"
          class="w-full rounded-2xl"
        />
        <template #help>
          <span class="text-muted-foreground text-xs">Cap the maximum discount amount</span>
        </template>
      </UFormField>
    </div>

    <div v-else class="grid gap-5 sm:grid-cols-2 mt-6">
      <UFormField
        label="Discount Amount"
        name="DiscountAmount"
        class="font-medium"
      >
        <UInput
          v-model="state.DiscountAmount"
          variant="outline"
          size="xl"
          type="number"
          :min="0"
          step="0.01"
          placeholder="0.00"
          class="w-full rounded-2xl"
        />
      </UFormField>
    </div>
  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:calendar-date-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Schedule</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Control when the discount starts and ends</p>

    <div class="grid gap-5 sm:grid-cols-2 mt-6">
      <UFormField
        label="Start Date"
        name="StartDateUtc"
        class="font-medium"
      >
        <UInput
          v-model="startDate"
          type="date"
          icon="solar:calendar-minimalistic-bold-duotone"
          size="xl"
          placeholder="Pick a start date"
          class="w-full rounded-2xl"
        />
        <template #help>
          <span class="text-muted-foreground text-xs">Leave empty to start immediately</span>
        </template>
      </UFormField>

      <UFormField
        label="End Date"
        name="EndDateUtc"
        class="font-medium"
      >
        <UInput
          v-model="endDate"
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
    class="flex flex-col max-w-4xl p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:shield-check-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Requirements & Behavior</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Configure coupon usage and stacking rules</p>

    <div class="flex flex-wrap gap-6 mt-6">
      <UFormField
        label="Requires Coupon Code"
        name="RequiresCouponCode"
        class="flex items-center justify-between gap-2"
      >
      <USwitch v-model="requiresCouponCode" :ui="{ base: 'cursor-pointer' }" />
      </UFormField>
      <UFormField
        label="Is Cumulative"
        name="IsCumulative"
        class="flex items-center justify-between gap-2"
      >
      <USwitch v-model="isCumulative" :ui="{ base: 'cursor-pointer' }" />
      </UFormField>
    </div>
  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:hourglass-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Usage Limits</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Set how many times this discount can be used</p>

    <div class="mt-6">
      <div class="grid gap-4">
        <button
          v-for="option in limitationCards"
          :key="option.value"
          type="button"
          class="flex items-start gap-3 rounded-2xl border p-4 text-left transition cursor-pointer"
          :class="selectedLimitationType === option.value
            ? 'border-primary ring-1 ring-primary/30 bg-primary/5 text-primary'
            : 'border-default hover:border-primary/40 hover:bg-primary/5'"
          @click="selectedLimitationType = option.value"
        >
          <span
            class="mt-1 flex size-5 items-center justify-center rounded-full border"
            :class="selectedLimitationType === option.value
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/40'"
          >
            <span
              class="size-2.5 rounded-full"
              :class="selectedLimitationType === option.value ? 'bg-primary' : 'bg-transparent'"
            />
          </span>
          <span class="flex flex-col gap-1">
            <span class="text-sm font-semibold text-default">{{ option.label }}</span>
            <span class="text-xs text-muted-foreground">{{ option.description }}</span>
          </span>
        </button>
      </div>

      <div v-if="requiresLimitationTimes" class="mt-6">
        <UFormField
          label="Number of Uses"
          name="LimitationTimes"
          class="font-medium"
        >
          <UInput
            v-model="state.LimitationTimes"
            size="xl"
            type="number"
            :min="0"
            placeholder="1"
            class="w-full rounded-2xl"
          />
          <template #help>
            <span class="text-muted-foreground text-xs">{{ limitationTimesHelp }}</span>
          </template>
        </UFormField>
      </div>
    </div>
  </UCard>

  <UCard
    variant="soft"
    class="flex flex-col max-w-4xl p-2 rounded-2xl mt-7"
  >
    <div class="flex gap-2 items-center">
      <Icon
        icon="solar:eye-bold-duotone"
        width="24"
        height="24"
        style="color: #00C16A"
      />
      <h3 class="text-xl font-medium">Status</h3>
    </div>
    <p class="text-sm text-muted-foreground mt-2">Control whether the discount is active</p>

    <div class="flex flex-wrap gap-6 mt-6">
      <UFormField
        label="Enabled"
        name="IsEnabled"
        class="flex items-center justify-between gap-2"
      >
        <USwitch v-model="isEnabled" :ui="{ base: 'cursor-pointer' }" />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { DiscountLimitationType, DiscountType, type UpsertDiscountDto } from '~/types/catalog/Discount'

  const state = defineModel<UpsertDiscountDto>('state', { required: true })

  const discountTypeCards = computed(() => [
    {
      label: 'Products',
      description: 'Apply to specific products',
      value: DiscountType.AssignedToProducts,
      icon: 'solar:box-minimalistic-bold-duotone'
    },
    {
      label: 'Categories',
      description: 'Apply to specific categories',
      value: DiscountType.AssignedToCategories,
      icon: 'solar:layers-bold-duotone'
    },
    {
      label: 'Brands',
      description: 'Apply to specific brands',
      value: DiscountType.AssignedToBrands,
      icon: 'solar:shop-bold-duotone'
    },
    {
      label: 'Shipping',
      description: 'Apply to shipping costs',
      value: DiscountType.AssignedToShipping,
      icon: 'solar:delivery-bold-duotone'
    },
    {
      label: 'Order Subtotal',
      description: 'Apply to order subtotal',
      value: DiscountType.AssignedToOrderSubtotal,
      icon: 'solar:cart-large-2-bold-duotone'
    },
    {
      label: 'Order Total',
      description: 'Apply to order total',
      value: DiscountType.AssignedToOrderTotal,
      icon: 'solar:bill-list-bold-duotone'
    }
  ])

  const limitationCards = computed(() => [
    {
      label: 'No Limits',
      description: 'Discount can be used unlimited times',
      value: String(DiscountLimitationType.NoLimits)
    },
    {
      label: 'Limited Uses (Total)',
      description: 'Discount can be used a set number of times in total',
      value: String(DiscountLimitationType.NTimes)
    },
    {
      label: 'Limited Uses (Per User)',
      description: 'Each customer can use this discount a set number of times',
      value: String(DiscountLimitationType.NTimesPerUser)
    }
  ])

  const selectedDiscountType = computed<string>({
    get: () => String(state.value.DiscountType),
    set: (val) => {
      const parsed = Number(val)
      state.value.DiscountType = Number.isFinite(parsed) ? (parsed as DiscountType) : DiscountType.AssignedToOrderSubtotal
    }
  })

  const selectedLimitationType = computed<string>({
    get: () => String(state.value.DiscountLimitationType ?? DiscountLimitationType.NoLimits),
    set: (val) => {
      const parsed = Number(val)
      state.value.DiscountLimitationType = Number.isFinite(parsed) ? (parsed as DiscountLimitationType) : DiscountLimitationType.NoLimits
    }
  })

  const usePercentage = computed({
    get: () => state.value.UsePercentage ?? false,
    set: (val) => {
      state.value.UsePercentage = val
    }
  })

  const requiresCouponCode = computed({
    get: () => state.value.RequiresCouponCode ?? false,
    set: (val) => {
      state.value.RequiresCouponCode = val
    }
  })

  const isCumulative = computed({
    get: () => state.value.IsCumulative ?? false,
    set: (val) => {
      state.value.IsCumulative = val
    }
  })

  const isEnabled = computed({
    get: () => state.value.IsEnabled ?? true,
    set: (val) => {
      state.value.IsEnabled = val
    }
  })

  const requiresLimitationTimes = computed(() => {
    const limitationType = state.value.DiscountLimitationType ?? DiscountLimitationType.NoLimits
    return limitationType === DiscountLimitationType.NTimes || limitationType === DiscountLimitationType.NTimesPerUser
  })

  const limitationTimesHelp = computed(() => {
    const limitationType = state.value.DiscountLimitationType ?? DiscountLimitationType.NoLimits
    return limitationType === DiscountLimitationType.NTimesPerUser
      ? 'Number of times each customer can use this discount'
      : 'Total number of times this discount can be used'
  })

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return ''
    return new Date(dateStr).toISOString().split('T')[0] || ''
  }

  const updateDate = (val: string, field: 'StartDateUtc' | 'EndDateUtc') => {
    if (!val) {
      state.value[field] = null
      return
    }
    state.value[field] = `${val}T00:00:00Z`
  }

  const startDate = computed({
    get: () => formatDate(state.value.StartDateUtc ?? null),
    set: (val) => updateDate(val, 'StartDateUtc')
  })

  const endDate = computed({
    get: () => formatDate(state.value.EndDateUtc ?? null),
    set: (val) => updateDate(val, 'EndDateUtc')
  })
</script>
