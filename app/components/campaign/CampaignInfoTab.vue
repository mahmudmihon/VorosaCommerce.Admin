<template>
  <div class="space-y-4">
    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:document-text-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Campaign Type</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Choose how this campaign will be delivered</p>

      <div class="grid gap-4 mt-6 sm:grid-cols-2">
        <button
          v-for="option in campaignTypeOptions"
          :key="option.value"
          type="button"
          class="flex items-start gap-3 rounded-2xl border border-default p-4 text-left transition hover:border-primary/60"
          :class="option.value === state.Type ? 'border-primary/60 bg-primary/5 shadow-sm' : 'bg-default'"
          @click="state.Type = option.value"
        >
          <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon
              :icon="option.icon"
              width="20"
              height="20"
            />
          </div>
          <div class="flex-1">
            <div class="font-semibold text-highlighted">{{ option.label }}</div>
            <div class="text-sm text-muted-foreground">{{ option.description }}</div>
          </div>
          <UIcon
            v-if="option.value === state.Type"
            name="i-solar:check-circle-bold-duotone"
            class="size-5 text-primary"
          />
        </button>
      </div>
    </UCard>

    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
    >
      <div class="flex gap-2 items-center">
        <Icon
          icon="solar:notes-bold-duotone"
          width="24"
          height="24"
          style="color: #00C16A"
        />
        <h3 class="text-xl font-medium">Campaign Details</h3>
      </div>
      <p class="text-sm text-muted-foreground mt-2">Define the basic details of your campaign</p>

      <div class="grid gap-5 mt-6">
        <UFormField
          label="Name"
          name="Name"
          class="font-medium"
          required
        >
          <UInput
            v-model="state.Name"
            variant="outline"
            size="xl"
            placeholder="e.g., Summer Newsletter"
            class="w-full rounded-2xl"
          />
        </UFormField>

        <UFormField
          v-if="state.Type === 'email'"
          label="Subject"
          name="Subject"
          class="font-medium"
          required
        >
          <UInput
            v-model="state.Subject"
            variant="outline"
            size="xl"
            placeholder="e.g., Don't miss our summer deals!"
            class="w-full rounded-2xl"
          />
          <template #help>
            <span class="text-xs text-muted-foreground">The subject line recipients will see in their inbox</span>
          </template>
        </UFormField>
      </div>

      <div
        ref="bodySectionRef"
        class="mt-6 space-y-4"
        :class="isBodyFullscreen ? 'fixed inset-0 z-50 bg-default p-6 flex flex-col min-h-0 overflow-hidden' : ''"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="text-base font-semibold text-highlighted">Body</div>
          <div
            v-if="state.Type !== 'sms'"
            class="flex flex-wrap items-center gap-2"
          >
            <UButton
              :icon="isBodyFullscreen ? 'i-solar:minimize-square-3-bold-duotone' : 'i-solar:maximize-square-3-bold-duotone'"
              size="sm"
              color="neutral"
              variant="soft"
              class="cursor-pointer rounded-full"
              @click="toggleBodyFullscreen"
            />
            <div class="flex flex-wrap items-center gap-2 rounded-full bg-elevated/50 p-1">
              <UButton
                v-if="editorMode === 'html'"
                icon="i-solar:eye-bold-duotone"
                size="sm"
                color="neutral"
                variant="soft"
                class="cursor-pointer rounded-full"
                @click="setEditorMode('preview')"
              />
              <UButton
                label="HTML Editor"
                icon="i-solar:code-circle-bold-duotone"
                size="sm"
                :color="editorMode === 'html' ? 'primary' : 'neutral'"
                :variant="editorMode === 'html' ? 'solid' : 'soft'"
                class="cursor-pointer rounded-full"
                @click="setEditorMode('html')"
              />
              <UButton
                label="Visual Builder"
                icon="i-solar:widget-4-bold-duotone"
                size="sm"
                :color="editorMode === 'visual' ? 'primary' : 'neutral'"
                :variant="editorMode === 'visual' ? 'solid' : 'soft'"
                class="cursor-pointer rounded-full"
                @click="setEditorMode('visual')"
              />
            </div>
          </div>
        </div>

        <div
          v-if="state.Type === 'sms'"
          class="rounded-2xl border border-default bg-default/60 p-2"
          :class="isBodyFullscreen ? 'flex-1 min-h-0' : ''"
        >
          <ClientOnly>
            <Codemirror
              v-model="smsBody"
              :extensions="smsEditorExtensions"
              :style="{ height: isBodyFullscreen ? '100%' : '360px' }"
              class="rounded-xl"
            />
          </ClientOnly>
        </div>

        <div
          v-else-if="editorMode === 'html'"
          class="rounded-2xl border border-default bg-default/60 p-2"
          :class="isBodyFullscreen ? 'flex-1 min-h-0' : ''"
        >
          <ClientOnly>
            <Codemirror
              v-model="state.BodyHtml"
              :extensions="editorExtensions"
              :style="{ height: isBodyFullscreen ? '100%' : '360px' }"
              class="rounded-xl"
            />
          </ClientOnly>
        </div>

        <div
          v-else-if="editorMode === 'visual'"
          class="rounded-2xl border border-default bg-default/60 p-2"
          :class="isBodyFullscreen ? 'flex-1 min-h-0' : ''"
        >
          <ClientOnly>
            <div
              v-if="!isBodyFullscreen"
              class="flex h-90 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-default bg-default text-center"
            >
              <div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UIcon name="i-solar:magic-stick-3-bold-duotone" class="size-7" />
              </div>
              <div class="space-y-1">
                <div class="text-base font-semibold text-highlighted">Visual Builder</div>
                <div class="text-sm text-muted-foreground">Drag and drop blocks to build your email template</div>
              </div>
              <UButton
                label="Open Visual Builder"
                icon="i-solar:maximize-square-3-bold-duotone"
                size="sm"
                color="primary"
                variant="soft"
                class="cursor-pointer rounded-full"
                @click="ensureBodyFullscreen"
              />
            </div>
            <EmailEditor
              v-else
              :min-height="isBodyFullscreen ? 0 : 360"
              :options="emailEditorOptions"
              class="w-full h-full"
              :style="isBodyFullscreen ? { height: '100%' } : undefined"
            />
          </ClientOnly>
        </div>

        <div
          v-else
          class="rounded-2xl border border-default bg-default/60 p-2"
          :class="isBodyFullscreen ? 'flex-1 min-h-0' : ''"
        >
          <iframe
            class="h-90 w-full rounded-xl bg-white"
            :class="isBodyFullscreen ? 'h-full' : ''"
            sandbox=""
            :srcdoc="state.BodyHtml"
          />
        </div>
      </div>
    </UCard>

    <UCard
      variant="soft"
      class="flex flex-col max-w-4xl p-2 rounded-2xl"
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
      <p class="text-sm text-muted-foreground mt-2">Choose when this campaign will be sent</p>

      <div class="mt-6">
        <UFormField
          label="Scheduled On"
          name="ScheduledOn"
          class="font-medium"
        >
          <UInput
            v-model="scheduledOnLocal"
            type="datetime-local"
            icon="solar:calendar-minimalistic-bold-duotone"
            size="xl"
            placeholder="Pick a date and time"
            class="w-full rounded-2xl"
          />
          <template #help>
            <span class="text-muted-foreground text-xs">Leave empty to send manually</span>
          </template>
        </UFormField>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { Codemirror } from 'vue-codemirror'
  import { html } from '@codemirror/lang-html'
  import { css, cssLanguage } from '@codemirror/lang-css'
  import { autocompletion } from '@codemirror/autocomplete'
  import { lintGutter, linter } from '@codemirror/lint'
  import { oneDark } from '@codemirror/theme-one-dark'
  import { EmailEditor } from 'vue-email-editor'
  import type { Diagnostic } from '@codemirror/lint'

  type CampaignType = 'email' | 'sms'

  type CampaignInfoState = {
    Id?: string
    Type: CampaignType
    Name: string
    Subject: string
    BodyHtml: string
    ScheduledOn?: string | null
  }

  const state = defineModel<CampaignInfoState>('state', { required: true })
  const colorMode = useColorMode()
  const editorMode = ref<'html' | 'visual' | 'preview'>('html')
  const campaignTypeOptions = [
    {
      value: 'email' as const,
      label: 'Email',
      description: 'Send personalized emails with rich content',
      icon: 'solar:letter-bold-duotone'
    },
    {
      value: 'sms' as const,
      label: 'SMS',
      description: 'Deliver short text messages to recipients',
      icon: 'solar:chat-round-line-bold-duotone'
    }
  ]

  const canLintCss = typeof window !== 'undefined' && typeof CSSStyleSheet !== 'undefined'

  const lintCssInHtml = (content: string): Diagnostic[] => {
    if (!canLintCss) return []
    const diagnostics: Diagnostic[] = []
    const regex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi

    for (const match of content.matchAll(regex)) {
      const fullMatch = match[0]
      const css = match[1] ?? ''
      const startIndex = match.index ?? 0
      const contentIndex = fullMatch.indexOf(css)
      const from = startIndex + Math.max(contentIndex, 0)
      const to = Math.max(from + css.length, from + 1)

      try {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)
      }
      catch (error) {
        diagnostics.push({
          from,
          to,
          severity: 'error',
          message: error instanceof Error ? error.message : 'Invalid CSS in <style> block'
        })
      }
    }

    return diagnostics
  }

  const bodySectionRef = ref<HTMLElement | null>(null)
  const isBodyFullscreen = ref(false)

  const formatLocalDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ''
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 16)
  }

  const updateScheduledOn = (val: string) => {
    if (!val) {
      state.value.ScheduledOn = null
      return
    }
    const date = new Date(val)
    if (Number.isNaN(date.getTime())) {
      state.value.ScheduledOn = null
      return
    }
    state.value.ScheduledOn = date.toISOString()
  }

  const scheduledOnLocal = computed({
    get: () => formatLocalDateTime(state.value.ScheduledOn),
    set: (val) => updateScheduledOn(val)
  })

  const toggleBodyFullscreen = async () => {
    if (!bodySectionRef.value) return
    if (!document.fullscreenElement) {
      try {
        await bodySectionRef.value.requestFullscreen()
        isBodyFullscreen.value = true
      }
      catch {
        isBodyFullscreen.value = !isBodyFullscreen.value
      }
      return
    }
    if (document.fullscreenElement === bodySectionRef.value) {
      await document.exitFullscreen()
      isBodyFullscreen.value = false
    }
  }

  const ensureBodyFullscreen = async () => {
    if (!bodySectionRef.value) return
    if (document.fullscreenElement === bodySectionRef.value) {
      isBodyFullscreen.value = true
      return
    }
    if (!document.fullscreenElement) {
      try {
        await bodySectionRef.value.requestFullscreen()
        isBodyFullscreen.value = true
      }
      catch {
        isBodyFullscreen.value = true
      }
    }
  }

  const setEditorMode = async (mode: 'html' | 'visual' | 'preview') => {
    editorMode.value = mode
    if (mode === 'preview') {
      await ensureBodyFullscreen()
    }
  }

  const emailEditorOptions = computed(() => ({
    displayMode: 'email',
    devices: ['desktop', 'mobile'],
    features: {
      preview: true
    }
  }))

  const onFullscreenChange = () => {
    isBodyFullscreen.value = document.fullscreenElement === bodySectionRef.value
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange)
  })

  const editorExtensions = computed(() => {
    const htmlLanguage = html({
      nestedLanguages: [
        { tag: 'style', parser: cssLanguage.parser }
      ],
      nestedAttributes: [
        { name: 'style', parser: cssLanguage.parser }
      ]
    })
    const base = colorMode.value === 'dark' ? [htmlLanguage, oneDark, css()] : [htmlLanguage, css()]
    return [
      ...base,
      autocompletion(),
      lintGutter(),
      linter(view => lintCssInHtml(view.state.doc.toString()))
    ]
  })

  const smsEditorExtensions = computed(() => {
    return colorMode.value === 'dark' ? [oneDark] : []
  })

  const smsBody = computed({
    get: () => (state.value.Type === 'sms' ? state.value.BodyHtml ?? '' : ''),
    set: (val: string) => {
      if (state.value.Type === 'sms') {
        state.value.BodyHtml = val
      }
    }
  })

  watch(() => state.value.Type, (type, prev) => {
    if (type === 'sms' && prev !== 'sms' && state.value.BodyHtml?.trim().startsWith('<')) {
      state.value.BodyHtml = ''
    }
  })
</script>
