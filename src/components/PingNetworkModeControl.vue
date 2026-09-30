<script setup lang="ts">
import { Button } from '@/components/ui/button'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  availabilityEnabled?: boolean
  availabilityActive?: boolean
}>(), {
  modelValue: false,
  availabilityEnabled: true,
  availabilityActive: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:availabilityActive': [value: boolean]
}>()

function setMode(showDetails: boolean): void {
  emit('update:availabilityActive', false)
  if (showDetails !== props.modelValue)
    emit('update:modelValue', showDetails)
}

function showAvailability(): void {
  emit('update:availabilityActive', true)
}
</script>

<template>
  <div class="inline-flex h-11 items-center rounded-md bg-muted/60 p-0 md:h-8" aria-label="节点展示模式">
    <Button
      type="button"
      variant="ghost"
      size="xs"
      class="h-11 min-w-12 rounded-sm px-2 text-[11px] md:h-7"
      :class="!modelValue && !availabilityActive ? 'bg-background text-violet-700 shadow-xs hover:bg-background dark:text-violet-400' : 'text-muted-foreground'"
      aria-label="显示三网摘要"
      :aria-pressed="!modelValue && !availabilityActive"
      @click="setMode(false)"
    >
      摘要
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="xs"
      class="h-11 min-w-12 rounded-sm px-2 text-[11px] md:h-7"
      :class="modelValue && !availabilityActive ? 'bg-background text-violet-700 shadow-xs hover:bg-background dark:text-violet-400' : 'text-muted-foreground'"
      aria-label="显示三网明细"
      :aria-pressed="modelValue && !availabilityActive"
      @click="setMode(true)"
    >
      明细
    </Button>
    <Button
      v-if="availabilityEnabled"
      type="button"
      variant="ghost"
      size="xs"
      class="h-11 min-w-14 rounded-sm px-2 text-[11px] md:h-7"
      :class="availabilityActive ? 'bg-background text-violet-700 shadow-xs hover:bg-background dark:text-violet-400' : 'text-muted-foreground'"
      aria-label="显示节点可用性"
      :aria-pressed="availabilityActive"
      @click="showAvailability"
    >
      可用性
    </Button>
  </div>
</template>
