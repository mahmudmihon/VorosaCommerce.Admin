<template>
  <UButton
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    class="cursor-pointer gap-2"
    :class="[!collapsed && 'py-2']"
    :ui="{ base: 'justify-start' }"
  >
    <img src="/icon.png" alt="VorosaCommerce" class="size-5">
    <span v-if="!collapsed" class="text-sm font-semibold">Vorosa Admin</span>
  </UButton>
</template>

<script setup lang="ts">
  defineProps<{
    collapsed?: boolean
  }>()
</script>
