import type { NodeData } from '@/stores/nodes'
import { formatDateTime, formatUptime } from '@/utils/helper'

export type NodeVolatilityStatus = 'stable' | 'elevated' | 'high'
export type NodeAvailabilityStatus = 'online' | 'offline' | 'unobserved'

export interface NodeVolatilityRowViewModel {
  uuid: string
  name: string
  score: number
  formattedScore: string
  status: NodeVolatilityStatus
  statusLabel: string
  loadSummary: string
}

export interface NodeAvailabilityRowViewModel {
  uuid: string
  name: string
  status: NodeAvailabilityStatus
  statusLabel: string
  detail: string
}

function nonNegativeFinite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function positiveFinite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function compareIdentity(a: Pick<NodeData, 'name' | 'uuid'>, b: Pick<NodeData, 'name' | 'uuid'>): number {
  return a.name.localeCompare(b.name, 'zh-CN') || a.uuid.localeCompare(b.uuid)
}

function volatilityStatus(score: number): NodeVolatilityStatus {
  if (score >= 25)
    return 'high'
  if (score >= 10)
    return 'elevated'
  return 'stable'
}

function volatilityStatusLabel(status: NodeVolatilityStatus): string {
  if (status === 'high')
    return '波动较高'
  if (status === 'elevated')
    return '存在波动'
  return '平稳'
}

export function buildNodeVolatilityRows(nodes: readonly NodeData[], limit = 5): NodeVolatilityRowViewModel[] {
  return nodes
    .filter(node => node.statusObserved && node.online)
    .map((node) => {
      const cores = positiveFinite(node.cpu_cores)
      const loads = [node.load, node.load5, node.load15].map(nonNegativeFinite)
      if (cores === null || loads.includes(null))
        return null

      const validLoads = loads as number[]
      const score = (Math.max(...validLoads) - Math.min(...validLoads)) / cores * 100
      if (!Number.isFinite(score))
        return null

      const roundedScore = Math.round(score * 10) / 10
      const status = volatilityStatus(roundedScore)
      return {
        uuid: node.uuid,
        name: node.name,
        score: roundedScore,
        formattedScore: `${roundedScore.toFixed(1)}%`,
        status,
        statusLabel: volatilityStatusLabel(status),
        loadSummary: `1m ${validLoads[0]!.toFixed(2)} · 5m ${validLoads[1]!.toFixed(2)} · 15m ${validLoads[2]!.toFixed(2)}`,
      }
    })
    .filter((row): row is NodeVolatilityRowViewModel => row !== null)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'zh-CN') || a.uuid.localeCompare(b.uuid))
    .slice(0, Math.max(0, limit))
}

function availabilityStatus(node: NodeData): NodeAvailabilityStatus {
  if (!node.statusObserved)
    return 'unobserved'
  return node.online ? 'online' : 'offline'
}

function availabilityStatusLabel(status: NodeAvailabilityStatus): string {
  if (status === 'online')
    return '在线'
  if (status === 'offline')
    return '离线'
  return '未收到状态'
}

function availabilityDetail(node: NodeData, status: NodeAvailabilityStatus): string {
  if (status === 'online')
    return `连续运行 ${formatUptime(nonNegativeFinite(node.uptime) ?? 0)}`
  if (status === 'unobserved')
    return '等待首次状态上报'

  const reportedAt = formatDateTime(node.time)
  return reportedAt === '-' ? '暂无最后上报时间' : `最后上报 ${reportedAt}`
}

export function buildNodeAvailabilityRows(nodes: readonly NodeData[]): NodeAvailabilityRowViewModel[] {
  const statusRank: Record<NodeAvailabilityStatus, number> = {
    offline: 0,
    unobserved: 1,
    online: 2,
  }

  return [...nodes]
    .sort((a, b) => {
      const aStatus = availabilityStatus(a)
      const bStatus = availabilityStatus(b)
      return statusRank[aStatus] - statusRank[bStatus] || compareIdentity(a, b)
    })
    .map((node) => {
      const status = availabilityStatus(node)
      return {
        uuid: node.uuid,
        name: node.name,
        status,
        statusLabel: availabilityStatusLabel(status),
        detail: availabilityDetail(node, status),
      }
    })
}
