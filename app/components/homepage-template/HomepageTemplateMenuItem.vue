<template>
  <div class="border border-gray-200 dark:border-gray-800 rounded-lg mb-2 bg-white dark:bg-gray-900">
    <div class="flex items-center justify-between p-3">
      <div class="flex items-center gap-2">
        <UButton
          v-if="item.Children && item.Children.length > 0"
          :icon="isOpen ? 'i-solar:minus-circle-bold-duotone' : 'i-solar:add-circle-bold-duotone'"
          :color="isOpen ? 'neutral' : 'primary'"
          variant="ghost"
          size="sm"
          class="shrink-0"
          @click="isOpen = !isOpen"
        />
        <div v-else class="w-8" />

        <span class="font-medium">{{ item.DisplayName }}</span>
      </div>

      <div class="flex items-center gap-2">
        <UTooltip text="Add sub menu">
          <UButton
            icon="i-solar:add-circle-bold-duotone"
            variant="soft"
            size="xs"
            class="text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:hover:bg-purple-900"
            @click="$emit('addSubMenu', item)"
          />
        </UTooltip>

        <UTooltip text="Edit">
          <UButton
            icon="i-solar:pen-bold-duotone"
            variant="soft"
            size="xs"
            class="text-cyan-600 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-400 dark:hover:bg-cyan-900"
            @click="$emit('edit', item)"
          />
        </UTooltip>

        <UTooltip text="Delete">
          <UButton
            icon="i-solar:trash-bin-trash-bold-duotone"
            variant="soft"
            size="xs"
            class="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
            @click="$emit('delete', item)"
          />
        </UTooltip>
      </div>
    </div>

    <div v-if="isOpen && item.Children && item.Children.length > 0" class="pl-8 pr-3 pb-3 border-t border-gray-100 dark:border-gray-800 pt-2">
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
