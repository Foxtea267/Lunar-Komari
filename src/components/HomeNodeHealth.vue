<script setup lang="ts">
import type { NodeVolatilityStatus } from '@/features/resource-overview/nodeHealth'
import type { NodeData } from '@/stores/nodes'
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import NodeEarthGlobe from '@/components/NodeEarthGlobe.vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { buildNodeVolatilityRows } from '@/features/resource-overview/nodeHealth'
import { useAppStore } from '@/stores/app'

const props = withDefaults(defineProps<{
  nodes?: readonly NodeData[]
  globeNodes?: NodeData[]
}>(), {
  nodes: () => [],
  globeNodes: () => [],
})

const appStore = useAppStore()
const router = useRouter()
const volatilityDialogOpen = ref(false)
const volatilityRows = computed(() => buildNodeVolatilityRows(props.nodes, 2))
const allVolatilityRows = computed(() => buildNodeVolatilityRows(props.nodes, props.nodes.length))

function showAllVolatility(): void {
  if (appStore.volatilityIndependentPage) {
    void router.push({ name: 'node-volatility' })
    return
  }
  volatilityDialogOpen.value = true
}

function volatilityClass(status: NodeVolatilityStatus): string {
  if (status === 'high')
    return 'bg-red-500/10 text-red-700 dark:text-red-300'
  if (status === 'elevated')
    return 'bg-amber-500/10 text-amber-800 dark:text-amber-200'
  return 'bg-green-500/10 text-green-700 dark:text-green-300'
}
</script>

<template>
  <section class="relative z-1 px-4 pb-4" aria-label="波动节点">
    <div class="grid grid-cols-1">
      <article class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-violet-500/15 bg-background/75 shadow-sm shadow-violet-950/5 backdrop-blur-xl">
        <header class="flex min-h-13 items-center gap-3 border-b border-border/70 px-4 py-2.5">
          <span class="grid size-8 place-items-center rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300">
            <Icon icon="lucide:activity" class="size-4" aria-hidden="true" />
          </span>
          <div class="min-w-0 flex-1">
            <h2 class="text-sm font-semibold text-foreground">
              波动节点
            </h2>
            <p class="text-[11px] text-muted-foreground">
              按 1 / 5 / 15 分钟负载跨度排序
            </p>
          </div>
          <span class="rounded-full bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-violet-700 dark:text-violet-300">Top 2</span>
        </header>

        <div v-if="volatilityRows.length === 0" class="grid min-h-32 place-items-center px-4 text-center text-xs text-muted-foreground">
          暂无可计算的在线节点
        </div>
        <ol v-else class="flex-1 px-3 py-1" aria-label="波动最严重的两个节点">
          <li v-for="row in volatilityRows" :key="row.uuid" class="border-b border-border/60 last:border-b-0">
            <RouterLink :to="{ name: 'instance-detail', params: { id: row.uuid } }" class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-violet-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40">
              <span class="min-w-0">
                <span class="flex items-center gap-2">
                  <span class="truncate text-sm font-medium text-foreground">{{ row.name }}</span>
                  <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" :class="volatilityClass(row.status)">{{ row.statusLabel }}</span>
                </span>
                <span class="mt-1 block truncate text-[11px] tabular-nums text-muted-foreground">{{ row.loadSummary }}</span>
              </span>
              <span class="text-base font-semibold tabular-nums text-foreground">{{ row.formattedScore }}</span>
            </RouterLink>
          </li>
        </ol>

        <button data-volatility-more type="button" class="group flex h-11 w-full items-center justify-center gap-1.5 border-t border-border/70 bg-muted/20 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-500/10 dark:text-violet-300" @click="showAllVolatility">
          查看更多
          <Icon icon="lucide:arrow-right" class="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
      </article>
    </div>

    <Dialog v-model:open="volatilityDialogOpen">
      <DialogContent class="max-h-[min(92vh,52rem)] max-w-6xl gap-0 overflow-y-auto p-0">
        <DialogHeader class="border-b border-border/60 px-5 py-4 pr-12">
          <DialogTitle>波动节点</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 p-4 lg:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
          <div class="mx-auto flex min-h-80 w-full max-w-md items-center justify-center overflow-visible px-3 pt-10">
            <NodeEarthGlobe :nodes="globeNodes" />
          </div>
          <div class="min-w-0 overflow-hidden rounded-xl border border-violet-500/15 bg-background/55">
            <div v-if="allVolatilityRows.length === 0" class="grid min-h-64 place-items-center px-4 text-center text-sm text-muted-foreground">
              暂无可计算的在线节点
            </div>
            <ol v-else class="px-3 py-1" aria-label="服务器列表">
              <li v-for="(row, index) in allVolatilityRows" :key="row.uuid" class="border-b border-border/60 last:border-b-0">
                <RouterLink :to="{ name: 'instance-detail', params: { id: row.uuid } }" class="grid grid-cols-[2rem_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg px-1 py-3 transition-colors hover:bg-violet-500/5" @click="volatilityDialogOpen = false">
                  <span class="text-center text-xs font-semibold tabular-nums text-muted-foreground">{{ index + 1 }}</span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium text-foreground">{{ row.name }}</span>
                    <span class="mt-0.5 block truncate text-[11px] tabular-nums text-muted-foreground">{{ row.loadSummary }}</span>
                  </span>
                  <span class="rounded-full px-2 py-1 text-[10px] font-medium" :class="volatilityClass(row.status)">{{ row.statusLabel }}</span>
                  <span class="w-14 text-right text-sm font-semibold tabular-nums text-foreground">{{ row.formattedScore }}</span>
                </RouterLink>
              </li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </section>
</template>
