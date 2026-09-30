<script setup lang="ts">
import type { NodeVolatilityModuleContract } from '@/features/resource-overview/contract'
import type { NodeVolatilityStatus } from '@/features/resource-overview/nodeHealth'
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { buildNodeVolatilityRows } from '@/features/resource-overview/nodeHealth'
import ResourcePanelShell from './ResourcePanelShell.vue'

const props = withDefaults(defineProps<{
  module: NodeVolatilityModuleContract
  nodes?: readonly NodeData[]
  loading?: boolean
}>(), {
  nodes: () => [],
  loading: false,
})

const rows = computed(() => buildNodeVolatilityRows(props.nodes, props.module.rendering.maxItems))
const summary = computed(() => {
  if (rows.value.length === 0)
    return '数值摘要：暂无可计算负载波动的在线节点。'
  const elevated = rows.value.filter(row => row.status !== 'stable').length
  return `数值摘要：按 1/5/15 分钟负载跨度排序，当前 ${elevated} 台存在明显波动。`
})

function statusClass(status: NodeVolatilityStatus): string {
  if (status === 'high')
    return 'bg-red-500/10 text-red-700 dark:text-red-300'
  if (status === 'elevated')
    return 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
  return 'bg-green-500/10 text-green-700 dark:text-green-300'
}
</script>

<template>
  <ResourcePanelShell
    :title="module.title"
    :summary="loading ? module.numericSummary.text : summary"
    :summary-visible="module.numericSummary.visible"
    labelled-by="resource-node-volatility-title"
    compact
  >
    <template #controls>
      <span class="rounded-full bg-violet-500/10 px-2 py-1 text-[11px] font-medium text-violet-700 dark:text-violet-300">
        Top {{ module.rendering.maxItems }}
      </span>
    </template>

    <div class="grid grid-cols-[minmax(0,1fr)_5.25rem_4rem] gap-2 px-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span>节点 / 负载</span>
      <span>状态</span>
      <span class="text-right">跨度</span>
    </div>
    <div v-if="loading" class="space-y-1" aria-hidden="true">
      <div v-for="index in module.rendering.maxItems" :key="index" class="grid h-12 grid-cols-[minmax(0,1fr)_5.25rem_4rem] items-center gap-2 border-t border-border/60 px-2">
        <span class="h-3 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <span class="h-5 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <span class="h-3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      </div>
    </div>
    <div v-else-if="rows.length === 0" class="flex min-h-44 flex-col items-center justify-center gap-2 text-center text-xs text-muted-foreground" role="status">
      <Icon icon="lucide:activity" class="size-6" aria-hidden="true" />
      暂无可计算的在线节点
    </div>
    <ol v-else aria-label="负载波动节点排行">
      <li v-for="row in rows" :key="row.uuid" class="grid min-h-12 grid-cols-[minmax(0,1fr)_5.25rem_4rem] items-center gap-2 border-t border-border/60 px-2 py-1.5">
        <span class="min-w-0">
          <span class="block truncate text-xs font-medium text-foreground" :title="row.name">{{ row.name }}</span>
          <span class="block truncate text-[10px] tabular-nums text-muted-foreground" :title="row.loadSummary">{{ row.loadSummary }}</span>
        </span>
        <span class="rounded-full px-2 py-1 text-center text-[10px] font-medium" :class="statusClass(row.status)">{{ row.statusLabel }}</span>
        <span class="text-right text-xs font-semibold tabular-nums text-foreground">{{ row.formattedScore }}</span>
      </li>
    </ol>
  </ResourcePanelShell>
</template>
