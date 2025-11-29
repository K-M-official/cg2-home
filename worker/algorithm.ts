import type { ItemHeatRecordWindow } from "./types";

// 时间加权算法的超参数：最近一段时间的权重
const RECENT_WEIGHT = 0.3;

/**
 * 计算加权窗口总和
 *
 * 定义：
 * - 总和1：时间区间 [t, now] 内所有窗口的 delta 之和
 * - 总和2：时间区间 [t - span, t) 内所有窗口的 delta 之和
 *
 * 返回：总和1 * 0.3 + 总和2 * (1 - 0.3)
 *
 * 注意：
 * - 这里按照窗口的 created_at 时间点来划分区间
 * - windows 一般是某个 item 的窗口列表，外部已按 item_id 过滤
 */
export function computeWeightedWindowSum(
  t: number,
  span: number,
  windows: ItemHeatRecordWindow[],
  now: number = Date.now(),
): number {
  if (span <= 0) {
    throw new Error("span must be positive");
  }

  let sumRecent = 0; // [t, now]
  let sumPast = 0;   // [t - span, t)

  const startPast = t - span;

  for (const w of windows) {
    const created = w.created_at;
    const value = w.delta;

    if (created >= t && created <= now) {
      sumRecent += value;
    } else if (created >= startPast && created < t) {
      sumPast += value;
    }
  }

  return sumRecent * RECENT_WEIGHT + sumPast * (1 - RECENT_WEIGHT);
}

// 第二个公式相关的超参数
const X0 = 0.6;
const K = 8;
const U = 0.5;
const P_BASE = 5;

/**
 * 根据输入的 M 计算非线性得分
 *
 * 步骤：
 * 1. a = -K * (M - X0)
 * 2. b = e^a
 * 3. score = (1 / (1 + b)) * U
 * 4. 返回 P_BASE + score
 *
 * 默认超参数：
 * - X0 = 0.6
 * - K = 8
 * - U = 0.5
 * - P_BASE = 5
 */
export function computeScoreFromM(M: number): number {
  const a = -K * (M - X0);
  const b = Math.exp(a);
  const score = (1 / (1 + b)) * U;
  return P_BASE + score;
}

