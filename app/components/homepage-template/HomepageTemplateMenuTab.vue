<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold flex items-center gap-2">
        <UIcon name="i-solar:list-bold-duotone" class="w-5 h-5" />
        Menus
      </h2>
      <UButton
        label="Add new"
        icon="i-solar:add-circle-line-duotone"
        color="primary"
        variant="outline"
        size="md"
        class="rounded-xl cursor-pointer"
        @click="addMenu"
      />
    </div>

    <div v-if="loading" class="space-y-2">
      <USkeleton class="h-12 w-full" v-for="i in 3" :key="i" />
    </div>

    <div v-else-if="!menus || menus.length === 0" class="text-center text-gray-500 py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
      <UIcon name="i-solar:hamburger-menu-broken" class="w-12 h-12 mx-auto mb-2 text-gray-400" />
      <p>No menus found. Click "Add new" to create one.</p>
    </div>

    <div v-else class="border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
      <HomepageTemplateMenuItem
        v-for="menu in menus"
        :key="menu.Id"
        :item="menu"
        @add-sub-menu="addSubMenu"
        @edit="editMenu"
        @delete="deleteMenu"
      />
    </div>

    <!-- Menu Modal -->
    <UModal v-model:open="isModalOpen" :title="editingMenu ? 'Edit Menu' : 'Add Menu'" :ui="{ content: 'w-full sm:max-w-4xl' }">
      <template #body>
        <UForm :schema="menuSchema" :state="menuState" class="space-y-4" @submit="onMenuSubmit">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Display Name" name="DisplayName" required>
              <UInput v-model="menuState.DisplayName" placeholder="Enter display name" autofocus class="w-full" />
            </UFormField>

            <UFormField label="URL" name="Url" required>
              <UInput v-model="menuState.Url" placeholder="Enter URL (e.g. /collections/all)" class="w-full" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Display Order" name="DisplayOrder">
              <UInput v-model="menuState.DisplayOrder" type="number" placeholder="0" class="w-full" />
            </UFormField>

            <div class="flex items-center pt-6">
               <UCheckbox v-model="menuState.IsActive" label="Active" />
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <UButton label="Cancel" color="neutral" variant="soft" @click="isModalOpen = false" class="rounded-xl cursor-pointer" />
            <UButton type="submit" label="Save" color="primary" :loading="saving" class="rounded-xl cursor-pointer" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import MenuService from '~/services/MenuService'
import type { MenuDto, UpsertMenuDto } from '~/types/homepagetemplate/Menu'
import HomepageTemplateMenuItem from './HomepageTemplateMenuItem.vue'

const props = defineProps<{
  templateId: string
}>()

const menus = ref<MenuDto[]>([])
const loading = ref(false)
const saving = ref(false)
const isModalOpen = ref(false)
const editingMenu = ref<MenuDto | null>(null)
const toast = useToast()

const menuState = reactive<UpsertMenuDto>({
  TemplateId: props.templateId,
  DisplayName: '',
  Url: '',
  DisplayOrder: 0,
  IsActive: true,
  ParentId: undefined
})

const menuSchema = z.object({
  DisplayName: z.string().min(1, 'Display name is required'),
  Url: z.string().min(1, 'URL is required'),
  DisplayOrder: z.number().int(),
  IsActive: z.boolean()
})

const fetchMenus = async () => {
  if (!props.templateId) return

  loading.value = true
  try {
    const allMenus = await MenuService.getMenus(props.templateId)
    menus.value = allMenus.filter(m => !m.ParentId)
  } catch (error) {
    console.error('Failed to fetch menus', error)
    toast.add({ title: 'Error', description: 'Failed to load menus', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMenus()
})

const resetForm = () => {
  menuState.Id = undefined
  menuState.TemplateId = props.templateId
  menuState.DisplayName = ''
  menuState.Url = ''
  menuState.DisplayOrder = 0
  menuState.IsActive = true
  menuState.ParentId = undefined
  editingMenu.value = null
}

const addMenu = () => {
  resetForm()
  isModalOpen.value = true
}

const addSubMenu = (parent: MenuDto) => {
  resetForm()
  menuState.ParentId = parent.Id
  isModalOpen.value = true
}

const editMenu = (menu: MenuDto) => {
  resetForm()
  editingMenu.value = menu
  menuState.Id = menu.Id
  menuState.TemplateId = menu.TemplateId
  menuState.DisplayName = menu.DisplayName
  menuState.Url = menu.Url
  menuState.DisplayOrder = menu.DisplayOrder
  menuState.IsActive = menu.IsActive
  menuState.ParentId = menu.ParentId
  isModalOpen.value = true
}

const deleteMenu = async (menu: MenuDto) => {
  if (!confirm('Are you sure you want to delete this menu?')) return

  try {
    await MenuService.deleteMenu(menu.Id)
    toast.add({ title: 'Success', description: 'Menu deleted successfully', color: 'success' })
    await fetchMenus()
  }
  catch (error) {
    console.error('Failed to delete menu', error)
    toast.add({ title: 'Error', description: 'Failed to delete menu', color: 'error' })
  }
}

const onMenuSubmit = async () => {
  saving.value = true

  try {
    // Ensure display order is a number
    menuState.DisplayOrder = Number(menuState.DisplayOrder)

    await MenuService.upsertMenu(menuState)
    toast.add({ title: 'Success', description: 'Menu saved successfully', color: 'success' })
    isModalOpen.value = false
    await fetchMenus()
  }
  catch (error) {
    console.error('Failed to save menu', error)
    toast.add({ title: 'Error', description: 'Failed to save menu', color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>
