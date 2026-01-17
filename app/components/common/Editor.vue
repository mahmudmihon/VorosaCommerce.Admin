<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'

const model = defineModel<string | undefined>({ default: '' })

const props = withDefaults(defineProps<{
  placeholder?: string
  minHeightClass?: string
}>(), {
  placeholder: '',
  minHeightClass: 'min-h-48'
})

const items: EditorToolbarItem[][] = [
  // History
  [{
    kind: 'undo',
    icon: 'i-lucide-undo',
    tooltip: { text: 'Undo' }
  }, {
    kind: 'redo',
    icon: 'i-lucide-redo',
    tooltip: { text: 'Redo' }
  }],
  // Headings
  [{
    icon: 'i-lucide-heading',
    tooltip: { text: 'Headings' },
    content: {
      align: 'start'
    },
    items: [{
      kind: 'heading',
      level: 1,
      icon: 'i-lucide-heading-1',
      label: 'Heading 1'
    }, {
      kind: 'heading',
      level: 2,
      icon: 'i-lucide-heading-2',
      label: 'Heading 2'
    }, {
      kind: 'heading',
      level: 3,
      icon: 'i-lucide-heading-3',
      label: 'Heading 3'
    }, {
      kind: 'heading',
      level: 4,
      icon: 'i-lucide-heading-4',
      label: 'Heading 4'
    }, {
      kind: 'paragraph',
      icon: 'i-lucide-pilcrow',
      label: 'Paragraph'
    }]
  }],
  // Formatting
  [{
    kind: 'mark',
    mark: 'bold',
    icon: 'i-lucide-bold',
    tooltip: { text: 'Bold' }
  }, {
    kind: 'mark',
    mark: 'italic',
    icon: 'i-lucide-italic',
    tooltip: { text: 'Italic' }
  }, {
    kind: 'mark',
    mark: 'underline',
    icon: 'i-lucide-underline',
    tooltip: { text: 'Underline' }
  }, {
    kind: 'mark',
    mark: 'strike',
    icon: 'i-lucide-strikethrough',
    tooltip: { text: 'Strikethrough' }
  }, {
    kind: 'mark',
    mark: 'subscript',
    icon: 'i-lucide-subscript',
    tooltip: { text: 'Subscript' }
  }, {
    kind: 'mark',
    mark: 'superscript',
    icon: 'i-lucide-superscript',
    tooltip: { text: 'Superscript' }
  }, {
    kind: 'mark',
    mark: 'code',
    icon: 'i-lucide-code',
    tooltip: { text: 'Code' }
  }],
  // Lists & Alignment
  [{
    kind: 'bulletList',
    icon: 'i-lucide-list',
    tooltip: { text: 'Bullet List' }
  }, {
    kind: 'orderedList',
    icon: 'i-lucide-list-ordered',
    tooltip: { text: 'Ordered List' }
  }, {
    icon: 'i-lucide-align-justify',
    tooltip: { text: 'Text Align' },
    content: {
      align: 'end'
    },
    items: [{
      kind: 'textAlign',
      align: 'left',
      icon: 'i-lucide-align-left',
      label: 'Align Left'
    }, {
      kind: 'textAlign',
      align: 'center',
      icon: 'i-lucide-align-center',
      label: 'Align Center'
    }, {
      kind: 'textAlign',
      align: 'right',
      icon: 'i-lucide-align-right',
      label: 'Align Right'
    }, {
      kind: 'textAlign',
      align: 'justify',
      icon: 'i-lucide-align-justify',
      label: 'Align Justify'
    }]
  }],
  // Special blocks
  [{
    kind: 'blockquote',
    icon: 'i-lucide-text-quote',
    tooltip: { text: 'Blockquote' }
  }, {
    kind: 'codeBlock',
    icon: 'i-lucide-square-code',
    tooltip: { text: 'Code Block' }
  }, {
    kind: 'horizontalRule',
    icon: 'i-lucide-minus',
    tooltip: { text: 'Horizontal Rule' }
  }],
  // Link
  [{
    kind: 'link',
    icon: 'i-lucide-link',
    tooltip: { text: 'Link' }
  }]
]
</script>

<template>
  <div class="w-full rounded-md border border-[var(--ui-border)] bg-[var(--ui-bg)]">
    <UEditor
      v-model="model"
      :placeholder="props.placeholder"
      :extensions="[
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
        Subscript,
        Superscript,
        Link.configure({ openOnClick: false }),
        Image
      ]"
      content-type="html"
      class="w-full"
      :class="[props.minHeightClass]"
    >
      <template #default="{ editor }">
        <div class="border-b border-[var(--ui-border)] p-2">
          <UEditorToolbar :editor="editor" :items="items" />
        </div>
      </template>
    </UEditor>
  </div>
</template>
