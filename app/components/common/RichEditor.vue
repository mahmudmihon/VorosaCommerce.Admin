<template>
  <ClientOnly>
    <Editor
      :key="colorMode.value"
      :model-value="modelValue"
      :id="id"
      license-key="gpl"
      tinymce-script-src="/tinymce/tinymce.min.js"
      :init="config"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
  import Editor from '@tinymce/tinymce-vue'

  const props = defineProps<{
    modelValue?: string
    id?: string
    height?: number
  }>()

  defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const colorMode = useColorMode()

  const config = computed(() => {
    const isDark = colorMode.value === 'dark'

    return {
      plugins: 'advlist anchor autolink charmap code fullscreen help image insertdatetime link lists media preview searchreplace table visualblocks wordcount',
      toolbar: 'undo redo | styles | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
      height: props.height || 500,
      promotion: false,
      branding: false,
      skin: isDark ? 'oxide-dark' : 'oxide',
      content_css: isDark ? 'dark' : 'default',
      width: '100%'
    }
  })
</script>
