/* eslint-disable no-console */
/**
 * 性能监控工具：耗时/FPS/内存/长任务 监控与告警
 *
 * 提供：
 * - 耗时埋点：startSpan/endSpan/measure/measureAsync
 * - FPS 监控：startFPS/stopFPS，低帧率告警
 * - 内存监控（Chrome）：startMemory/stopMemory，超过阈值或快速增长告警
 * - Long Task 监控（可用时）：主线程阻塞告警
 * - 统一 onWarning 回调与统计接口
 */

export type WarningType = 'span' | 'fps' | 'memory' | 'longtask';
export interface WarningEvent {
  type: WarningType;
  message: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface PerformanceMonitorOptions {
  // 采样间隔（FPS 通过 rAF 计算，但汇报按该间隔聚合）
  sampleIntervalMs?: number; // 默认 1000ms
  // 阈值：单次操作耗时(ms)
  spanWarnMs?: number; // 默认 120
  // 阈值：FPS 下限
  minFps?: number; // 默认 45
  // 阈值：内存使用（MB）
  maxMemoryMB?: number; // 默认 1024
  // 阈值：内存增长（MB/采样周期）
  memoryGrowthWarnMB?: number; // 默认 64
  // 是否启用 LongTask 监控
  enableLongTaskObserver?: boolean; // 默认 true
  // 是否打印警告到控制台
  logWarnings?: boolean; // 默认 true
}

export interface SpanRecord {
  id: string;
  name: string;
  start: number;
  end?: number;
  durationMs?: number;
}

export interface PerfStats {
  fps: number;
  lastSpan?: SpanRecord;
  spans: SpanRecord[];
  memory?: {
    usedMB: number;
    totalMB: number;
    limitMB?: number;
    lastDeltaMB?: number;
  };
  warnings: WarningEvent[];
}

type WarningHandler = (evt: WarningEvent) => void;

// Browser-only globals扩展
declare global {
  interface Performance {
    memory?: {
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
      usedJSHeapSize: number;
    };
  }
  interface Navigator {
    deviceMemory?: number;
  }
}

export class PerformanceMonitor {
  private opts: Required<PerformanceMonitorOptions>;
  private spans = new Map<string, SpanRecord>();
  private spanIdSeq = 0;
  private lastSpan?: SpanRecord;

  // FPS
  private fpsEnabled = false;
  private rafId = 0;
  private frames = 0;
  private fps = 60;
  private lastFpsTick = 0;
  private fpsTimer = 0;

  // Memory
  private memoryEnabled = false;
  private memoryTimer = 0;
  private lastUsedMB = 0;

  // LongTask
  private longTaskObserver?: PerformanceObserver;

  // warnings
  private warnings: WarningEvent[] = [];
  private warningHandlers: WarningHandler[] = [];

  constructor(options: PerformanceMonitorOptions = {}) {
    this.opts = {
      sampleIntervalMs: options.sampleIntervalMs ?? 1000,
      spanWarnMs: options.spanWarnMs ?? 120,
      minFps: options.minFps ?? 45,
      maxMemoryMB: options.maxMemoryMB ?? 1024,
      memoryGrowthWarnMB: options.memoryGrowthWarnMB ?? 64,
      enableLongTaskObserver: options.enableLongTaskObserver ?? true,
      logWarnings: options.logWarnings ?? true
    };
  }

  // ============ 警告 ============
  onWarning(handler: WarningHandler) {
    this.warningHandlers.push(handler);
  }

  private emitWarning(evt: WarningEvent) {
    this.warnings.push(evt);
    if (this.opts.logWarnings) {
      // 仅警告，不中断
      console.warn('[PerfMonitor]', evt.message, evt.data || {});
    }
    for (const h of this.warningHandlers) {
      try {
        h(evt);
      } catch {
        // 忽略用户回调内部错误
      }
    }
  }

  // ============ 耗时埋点 ============
  startSpan(name: string): string {
    const id = `${Date.now()}_${++this.spanIdSeq}`;
    const start = performance.now();
    const rec: SpanRecord = { id, name, start };
    this.spans.set(id, rec);
    return id;
  }

  endSpan(id: string): SpanRecord | undefined {
    const rec = this.spans.get(id);
    if (!rec) return undefined;
    rec.end = performance.now();
    rec.durationMs = rec.end - rec.start;
    this.lastSpan = rec;
    // 阈值告警
    if (rec.durationMs >= this.opts.spanWarnMs) {
      this.emitWarning({
        type: 'span',
        message: `操作 "${rec.name}" 耗时 ${rec.durationMs.toFixed(1)}ms，超过阈值 ${this.opts.spanWarnMs}ms`,
        data: { name: rec.name, durationMs: rec.durationMs, thresholdMs: this.opts.spanWarnMs },
        timestamp: Date.now()
      });
    }
    // 移除记录但保留 lastSpan
    this.spans.delete(id);
    return rec;
  }

  measure<T>(name: string, fn: () => T): T {
    const id = this.startSpan(name);
    try {
      return fn();
    } finally {
      this.endSpan(id);
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const id = this.startSpan(name);
    try {
      return await fn();
    } finally {
      this.endSpan(id);
    }
  }

  // ============ FPS ============
  startFPS() {
    if (this.fpsEnabled) return;
    this.fpsEnabled = true;
    this.frames = 0;
    this.lastFpsTick = performance.now();

    const loop = () => {
      if (!this.fpsEnabled) return;
      this.frames++;
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);

    // 聚合计算 FPS
    this.fpsTimer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - this.lastFpsTick;
      if (elapsed > 0) {
        this.fps = (this.frames / elapsed) * 1000;
      } else {
        this.fps = 60;
      }
      this.frames = 0;
      this.lastFpsTick = now;
      if (this.fps < this.opts.minFps) {
        this.emitWarning({
          type: 'fps',
          message: `FPS 降至 ${this.fps.toFixed(1)}，低于阈值 ${this.opts.minFps}`,
          data: { fps: this.fps, threshold: this.opts.minFps },
          timestamp: Date.now()
        });
      }
    }, this.opts.sampleIntervalMs);
  }

  stopFPS() {
    this.fpsEnabled = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.fpsTimer) clearInterval(this.fpsTimer);
    this.rafId = 0;
    this.fpsTimer = 0;
  }

  getFPS(): number {
    return this.fps;
  }

  // ============ 内存 ============
  startMemory() {
    if (this.memoryEnabled) return;
    if (!performance || !performance.memory) {
      // 环境不支持，静默跳过
      this.memoryEnabled = false;
      return;
    }
    this.memoryEnabled = true;
    this.lastUsedMB = this.getUsedMemoryMB();

    this.memoryTimer = window.setInterval(() => {
      if (!this.memoryEnabled) return;
      const usedMB = this.getUsedMemoryMB();
      const totalMB = this.getTotalMemoryMB();
      const limitMB = this.getLimitMemoryMB();
      const delta = usedMB - this.lastUsedMB;

      if (usedMB >= this.opts.maxMemoryMB) {
        this.emitWarning({
          type: 'memory',
          message: `内存使用 ${usedMB.toFixed(0)}MB 超过阈值 ${this.opts.maxMemoryMB}MB`,
          data: { usedMB, totalMB, limitMB, thresholdMB: this.opts.maxMemoryMB },
          timestamp: Date.now()
        });
      } else if (delta >= this.opts.memoryGrowthWarnMB) {
        this.emitWarning({
          type: 'memory',
          message: `内存在一个采样周期内增长了 ${delta.toFixed(0)}MB，超过阈值 ${this.opts.memoryGrowthWarnMB}MB`,
          data: { deltaMB: delta, usedMB, totalMB, limitMB, thresholdMB: this.opts.memoryGrowthWarnMB },
          timestamp: Date.now()
        });
      }

      this.lastUsedMB = usedMB;
    }, this.opts.sampleIntervalMs);
  }

  stopMemory() {
    this.memoryEnabled = false;
    if (this.memoryTimer) clearInterval(this.memoryTimer);
    this.memoryTimer = 0;
  }

  private getUsedMemoryMB(): number {
    const mem = performance.memory!;
    return mem.usedJSHeapSize / (1024 * 1024);
    // eslint-disable-next-line no-unreachable
  }
  private getTotalMemoryMB(): number {
    const mem = performance.memory!;
    return mem.totalJSHeapSize / (1024 * 1024);
  }
  private getLimitMemoryMB(): number | undefined {
    const mem = performance.memory!;
    return mem.jsHeapSizeLimit ? mem.jsHeapSizeLimit / (1024 * 1024) : undefined;
  }

  // ============ Long Task ============
  startLongTaskObserver() {
    if (!this.opts.enableLongTaskObserver) return;
    if (typeof PerformanceObserver === 'undefined') return;
    try {
      this.longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // entry.duration 单位 ms
          this.emitWarning({
            type: 'longtask',
            message: `检测到 Long Task，持续 ${entry.duration.toFixed(1)}ms`,
            data: { durationMs: entry.duration, name: entry.name, startTime: entry.startTime },
            timestamp: Date.now()
          });
        }
      });
      // longtask 在部分环境不可用，try/catch 保护
      this.longTaskObserver.observe({ type: 'longtask', buffered: true } as any);
    } catch {
      // 忽略不支持场景
    }
  }

  stopLongTaskObserver() {
    try {
      this.longTaskObserver?.disconnect();
    } catch {
      // ignore
    } finally {
      this.longTaskObserver = undefined;
    }
  }

  // ============ 控制 ============
  start() {
    this.startFPS();
    this.startMemory();
    this.startLongTaskObserver();
  }

  stop() {
    this.stopFPS();
    this.stopMemory();
    this.stopLongTaskObserver();
  }

  reset() {
    this.stop();
    this.spans.clear();
    this.lastSpan = undefined;
    this.warnings = [];
  }

  // ============ 统计 ============
  getStats(): PerfStats {
    const mem = performance.memory;
    const usedMB = mem ? mem.usedJSHeapSize / (1024 * 1024) : 0;
    const totalMB = mem ? mem.totalJSHeapSize / (1024 * 1024) : 0;
    const limitMB = mem && mem.jsHeapSizeLimit ? mem.jsHeapSizeLimit / (1024 * 1024) : undefined;

    return {
      fps: this.fps,
      lastSpan: this.lastSpan,
      spans: this.lastSpan ? [this.lastSpan] : [],
      memory: mem
        ? {
            usedMB,
            totalMB,
            limitMB,
            lastDeltaMB: usedMB - this.lastUsedMB
          }
        : undefined,
      warnings: [...this.warnings]
    };
  }
}

// 工具方法：创建并默认启动基础监控
export function createPerformanceMonitor(options?: PerformanceMonitorOptions) {
  const monitor = new PerformanceMonitor(options);
  monitor.start();
  return monitor;
}

export default PerformanceMonitor;