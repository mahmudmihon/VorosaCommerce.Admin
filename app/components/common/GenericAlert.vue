<template>
  <UAlert
    :title="title"
    :description="description"
    :color="color"
    :variant="variant"
    :icon="icon"
  />
</template>

<script setup lang="ts">
  type AlertColor = 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'
  type AlertVariant = 'outline' | 'solid' | 'soft' | 'subtle'

  withDefaults(defineProps<{
    title: string
    description?: string
    color?: AlertColor
    variant?: AlertVariant
    icon?: string
  }>(), {
    color: 'neutral',
    variant: 'outline',
    description: undefined,
    icon: undefined
  })
</script>
