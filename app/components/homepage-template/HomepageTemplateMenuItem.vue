<template>
  <div class="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
    <div class="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group rounded-xl">
      <div class="flex items-center gap-3">
        <button
          v-if="item.Children && item.Children.length > 0"
          class="flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
          @click="isOpen = !isOpen"
        >
          <UIcon :name="isOpen ? 'i-solar:round-alt-arrow-down-line-duotone' : 'i-solar:round-alt-arrow-right-line-duotone'" class="w-5 h-5" />
        </button>
        <div v-else class="w-5" />

        <span class="font-medium text-gray-700 dark:text-gray-200">{{ item.DisplayName }}</span>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          label="Add sub menu"
          icon="i-solar:add-circle-line-duotone"
          variant="outline"
          color="primary"
          size="md"
          class="rounded-xl px-3 font-medium cursor-pointer"
          @click="$emit('addSubMenu', item)"
        />
        <UButton
          label="Edit"
          icon="i-solar:pen-new-square-line-duotone"
          variant="outline"
          color="primary"
          size="md"
          class="rounded-xl px-3 font-medium cursor-pointer"
          @click="$emit('edit', item)"
        />
        <UButton
          icon="i-solar:trash-bin-2-bold-duotone"
          variant="ghost"
          color="neutral"
          size="md"
          class="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10 pointer-events-none group-hover:pointer-events-auto"
          @click="$emit('delete', item)"
        />
      </div>
    </div>

    <div v-if="isOpen && item.Children && item.Children.length > 0" class="pl-8">
      <HomepageTemplateMenuItem
        v-for="child in item.Children"
        :key="child.Id"
        :item="child"
        @add-sub-menu="$emit('addSubMenu', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { MenuDto } from '~/types/homepagetemplate/Menu'

  const props = defineProps<{
    item: MenuDto
  }>()

  const emit = defineEmits<{
    (e: 'addSubMenu', item: MenuDto): void
    (e: 'edit', item: MenuDto): void
    (e: 'delete', item: MenuDto): void
  }>()

  const isOpen = ref(true)
</script>
