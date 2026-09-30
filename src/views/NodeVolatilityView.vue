<script setup lang="ts">
import type { NodeVolatilityStatus } from '@/features/resource-overview/nodeHealth'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { buildNodeVolatilityRows } from '@/features/resource-overview/nodeHealth'
import { useNodesStore } from '@/stores/nodes'

const nodesStore = useNodesStore()
const rows = computed(() => buildNodeVolatilityRows(nodesStore.nodes, nodesStore.nodes.length))
function statusClass(status: NodeVolatilityStatus): string {
  if (status === 'high')
    return 'bg-red-500/10 text-red-700 dark:text-red-300'
  if (status === 'elevated')
    return 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
  return 'bg-green-500/10 text-green-700 dark:text-green-300'
}
</script>

<template>
  <section class="px-4 py-5" aria-labelledby="node-volatility-title">
    <div class="mb-5 flex flex-wrap items-start gap-4">
      <RouterLink :to="{ name: 'home' }" class="-ml-2 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <Icon icon="lucide:arrow-left" class="size-4" aria-hidden="true" />
        返回首页
      </RouterLink>
      <div class="min-w-0 flex-1 basis-full sm:basis-auto">
        <h1 id="node-volatility-title" class="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          波动节点
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          查看全部在线节点的 1 / 5 / 15 分钟负载跨度，并在地球上确认节点分布。
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-[minmax(19rem,0.78fr)_minmax(0,1.22fr)]">
      <div class="mx-auto flex min-h-[28rem] w-full max-w-md items-center justify-center overflow-visible px-3 pt-12 lg:-mt-12">
        <NodeEarthGlobe :nodes="nodesStore.earthNodes" />
      </div>

      <article class="min-w-0 overflow-hidden rounded-xl border border-violet-500/15 bg-background/75 shadow-sm shadow-violet-950/5 backdrop-blur-xl">
        <div v-if="rows.length === 0" class="grid min-h-[19rem] place-items-center px-4 text-center text-xs text-muted-foreground">
          暂无可计算的在线节点
        </div>
        <ol v-else class="px-3 py-1" aria-label="服务器列表">
          <li v-for="(row, index) in rows" :key="row.uuid" class="border-b border-border/60 last:border-b-0">
            <RouterLink :to="{ name: 'instance-detail', params: { id: row.uuid } }" class="grid grid-cols-[2rem_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-violet-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40">
              <span class="text-center text-xs font-semibold tabular-nums text-muted-foreground">{{ index + 1 }}</span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-medium text-foreground">{{ row.name }}</span>
                <span class="mt-0.5 block truncate text-[11px] tabular-nums text-muted-foreground">{{ row.loadSummary }}</span>
              </span>
              <span class="rounded-full px-2 py-1 text-[10px] font-medium" :class="statusClass(row.status)">{{ row.statusLabel }}</span>
              <span class="w-14 text-right text-sm font-semibold tabular-nums text-foreground">{{ row.formattedScore }}</span>
            </RouterLink>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>
