<script setup lang="ts">
import type { NodeAvailabilityStatus } from '@/features/resource-overview/nodeHealth'
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { buildNodeAvailabilityRows } from '@/features/resource-overview/nodeHealth'

const props = withDefaults(defineProps<{
  nodes?: readonly NodeData[]
}>(), {
  nodes: () => [],
})

const rows = computed(() => buildNodeAvailabilityRows(props.nodes))
const onlineCount = computed(() => rows.value.filter(row => row.status === 'online').length)

function barClass(status: NodeAvailabilityStatus): string {
  if (status === 'offline')
    return 'bg-red-500'
  if (status === 'unobserved')
    return 'bg-slate-300 dark:bg-slate-600'
  return 'bg-green-500'
}

function statusClass(status: NodeAvailabilityStatus): string {
  if (status === 'offline')
    return 'text-red-700 dark:text-red-300'
  if (status === 'unobserved')
    return 'text-muted-foreground'
  return 'text-green-700 dark:text-green-300'
}
</script>

<template>
  <article class="overflow-hidden rounded-xl border border-violet-500/15 bg-background/75 shadow-sm shadow-violet-950/5 backdrop-blur-xl">
    <header class="flex min-h-13 items-center gap-3 border-b border-border/70 px-4 py-2.5">
      <span class="grid size-8 place-items-center rounded-lg bg-green-500/10 text-green-700 dark:text-green-300">
        <Icon icon="lucide:shield-check" class="size-4" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <h2 class="text-sm font-semibold text-foreground">
          节点可用性
        </h2>
        <p class="text-[11px] text-muted-foreground">
          {{ onlineCount }} / {{ rows.length }} 个节点在线
        </p>
      </div>
      <div class="hidden items-center gap-3 text-[10px] text-muted-foreground sm:flex">
        <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-green-500" />在线</span>
        <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-red-500" />离线</span>
        <span class="flex items-center gap-1"><span class="size-2 rounded-full bg-slate-400" />未上报</span>
      </div>
    </header>

    <div v-if="rows.length === 0" class="grid min-h-48 place-items-center px-4 text-center text-sm text-muted-foreground">
      暂无节点数据
    </div>
    <ol v-else class="px-3 py-1" aria-label="节点实时可用性列表">
      <li v-for="row in rows" :key="row.uuid" class="border-b border-border/60 last:border-b-0">
        <RouterLink :to="{ name: 'instance-detail', params: { id: row.uuid } }" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-lg px-2 py-3 transition-colors hover:bg-violet-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 md:grid-cols-[minmax(10rem,0.7fr)_minmax(14rem,1.3fr)_auto]">
          <span class="col-start-1 row-start-1 min-w-0">
            <span class="block truncate text-sm font-medium text-foreground">{{ row.name }}</span>
            <span class="block truncate text-[11px] text-muted-foreground">{{ row.detail }}</span>
          </span>
          <span class="col-span-2 col-start-1 row-start-2 flex min-w-0 items-center gap-1 md:col-span-1 md:col-start-2 md:row-start-1" :aria-label="`${row.name}：${row.statusLabel}`">
            <span v-for="segment in 24" :key="segment" class="h-7 min-w-0 flex-1 rounded-[3px] opacity-85" :class="barClass(row.status)" aria-hidden="true" />
          </span>
          <span class="col-start-2 row-start-1 w-14 text-right text-xs font-medium md:col-start-3" :class="statusClass(row.status)">{{ row.statusLabel }}</span>
        </RouterLink>
      </li>
    </ol>
  </article>
</template>
