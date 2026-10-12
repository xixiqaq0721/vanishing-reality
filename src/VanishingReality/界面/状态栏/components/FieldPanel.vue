<template>
  <section class="field">
    <header class="field-head">
      <h3>VaiR · 领域现况</h3>
      <p>{{ 时段.名 }} —— {{ 时段.注 }}</p>
    </header>

    <dl class="readouts">
      <div class="readout">
        <dt><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i> 侵蚀进度</dt>
        <dd class="metric">{{ 领域.侵蚀进度 }}<small>%</small></dd>
      </div>
      <div class="readout">
        <dt><i class="fa-solid fa-tower-broadcast" aria-hidden="true"></i> 在播观众</dt>
        <dd class="metric audience">{{ 领域.观众.toLocaleString('en-US') }}</dd>
      </div>
      <div class="readout">
        <dt><i class="fa-solid fa-star" aria-hidden="true"></i> 星尘流量</dt>
        <dd class="metric star">{{ 领域.星尘流量 }}<small>%</small></dd>
      </div>
    </dl>

    <p class="flow-note">观众的意念会转成 Star Particle Charm 送到她手上。流量压得越低，她的绝招越迟。</p>

    <h4 class="log-title">纪事</h4>
    <ol class="log">
      <li v-for="(条, 名) in 纪事" :key="名">
        <span class="turn metric">R{{ 条.回合 }}</span>
        <span class="entry">
          <b>{{ 名 }}</b>
          <span>{{ 条.记述 }}</span>
        </span>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 侵蚀时段 } from '../../../derived';
import { useDataStore } from '../store';

const 数据 = useDataStore().data;
const 领域 = computed(() => 数据.领域);
const 时段 = computed(() => 侵蚀时段(领域.value.侵蚀进度));
const 纪事 = computed(() => 数据.纪事);
</script>

<style lang="scss" scoped>
.field-head {
  margin-bottom: 9px;

  h3 {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--c-holy);
  }

  p {
    margin-top: 2px;
    font-size: 11px;
    color: var(--c-text-muted);
  }
}

.readouts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.readout {
  padding: 8px 10px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface-2);

  dt {
    font-size: 10px;
    letter-spacing: 0.06em;
    color: var(--c-text-muted);

    i {
      margin-right: 4px;
    }
  }

  dd {
    margin-top: 2px;
    font-size: 16px;

    small {
      margin-left: 1px;
      font-size: 9px;
      color: var(--c-text-muted);
    }
  }
}

.flow-note {
  margin-top: 8px;
  font-size: 10px;
  line-height: 1.5;
  color: var(--c-text-muted);
}

.log-title {
  margin: 11px 0 6px;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--c-text-muted);
  font-weight: 600;
}

.log {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;

  li {
    display: flex;
    gap: 8px;
    padding: 6px 9px;
    border-left: 2px solid var(--c-taint);
    border-radius: 0 6px 6px 0;
    background: var(--c-surface-2);
  }
}

.turn {
  flex: none;
  font-size: 10px;
  color: var(--c-text-muted);
  padding-top: 1px;
}

.entry {
  display: flex;
  flex-direction: column;
  min-width: 0;

  b {
    font-size: 11px;
    color: var(--c-holy);
  }

  span {
    font-size: 11px;
    line-height: 1.45;
    color: var(--c-text-muted);
    overflow-wrap: anywhere;
  }
}

.metric {
  font-family: var(--font-metric);
  font-variant-numeric: tabular-nums;

  &.audience {
    color: var(--c-audience);
  }

  &.star {
    color: var(--c-star);
  }
}
</style>
