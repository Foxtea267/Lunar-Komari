<script setup lang="ts">
import type { NodeAvailabilityModuleContract } from '@/features/resource-overview/contract'
import type { NodeAvailabilityStatus } from '@/features/resource-overview/nodeHealth'
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { buildNodeAvailabilityRows } from '@/features/resource-overview/nodeHealth'
import ResourcePanelShell from './ResourcePanelShell.vue'

const props = withDefaults(defineProps<{
  module: NodeAvailabilityModuleContract
  nodes?: readonly NodeData[]
  loading?: boolean
}>(), {
  nodes: () => [],
  loading: false,
})

const rows = computed(() => buildNodeAvailabilityRows(props.nodes))
const onlineCount = computed(() => rows.value.filter(row => row.status === 'online').length)
const summary = computed(() => `数值摘要：${onlineCount.value} / ${rows.value.length} 台在线，离线与未上报节点优先排列。`)

function statusPresentation(status: NodeAvailabilityStatus): { dot: string, text: string, icon: string } {
  if (status === 'offline')
    return { dot: 'bg-red-600', text: 'text-red-700 dark:text-red-300', icon: 'lucide:circle-x' }
  if (status === 'unobserved')
    return { dot: 'bg-slate-400', text: 'text-muted-foreground', icon: 'lucide:circle-help' }
  return { dot: 'bg-green-600', text: 'text-green-700 dark:text-green-300', icon: 'lucide:circle-check' }
}
</script>

<template>
  <ResourcePanelShell
    :title="module.title"
    :summary="loading ? module.numericSummary.text : summary"
    :summary-visible="module.numericSummary.visible"
    labelled-by="resource-node-availability-title"
    compact
  >
    <template #controls>
      <span class="rounded-full bg-green-500/10 px-2 py-1 text-[11px] font-medium text-green-700 dark:text-green-300">
        {{ onlineCount }} / {{ rows.length }} 在线
      </span>
    </template>

    <div v-if="loading" class="space-y-1" aria-hidden="true">
      <div v-for="index in 5" :key="index" class="grid h-12 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 border-t border-border/60 px-2">
        <span class="h-3 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <span class="h-3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      </div>
    </div>
    <div v-else-if="rows.length === 0" class="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground" role="status">
      <Icon icon="lucide:server-off" class="size-6" aria-hidden="true" />
      暂无节点数据
    </div>
    <ol v-else class="max-h-64 overflow-y-auto overscroll-contain" aria-label="节点可用性列表">
      <li v-for="row in rows" :key="row.uuid" class="grid min-h-12 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-3 border-t border-border/60 px-2 py-1.5">
        <span class="flex min-w-0 items-center gap-2">
          <span class="size-2 shrink-0 rounded-full" :class="statusPresentation(row.status).dot" aria-hidden="true" />
          <span class="min-w-0">
            <span class="block truncate text-xs font-medium text-foreground" :title="row.name">{{ row.name }}</span>
            <span class="block truncate text-[10px] tabular-nums text-muted-foreground" :title="row.detail">{{ row.detail }}</span>
          </span>
        </span>
        <span class="flex items-center justify-end gap-1 text-[11px] font-medium" :class="statusPresentation(row.status).text">
          <Icon :icon="statusPresentation(row.status).icon" class="size-3.5" aria-hidden="true" />
          {{ row.statusLabel }}
        </span>
      </li>
    </ol>
  </ResourcePanelShell>
</template>
