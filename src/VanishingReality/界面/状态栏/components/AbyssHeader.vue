<template>
  <header class="abyss-head">
    <div class="identity">
      <span class="sigil" aria-hidden="true"></span>
      <span class="labels">
        <span class="kind">侵渊魔 · Invasion Abyss</span>
        <span class="stage">{{ 阶段.名 }}</span>
      </span>
    </div>

    <dl class="gauges">
      <div class="gauge">
        <dt>VaiR 侵蚀</dt>
        <dd class="metric">{{ 领域.侵蚀进度 }}<small>%</small></dd>
        <span class="bar"><i :style="{ width: 领域.侵蚀进度 + '%' }"></i></span>
        <span class="sub">{{ 时段.名 }}</span>
      </div>

      <div class="gauge">
        <dt>支配版图</dt>
        <dd class="metric">{{ 侵渊.支配版图 }}<small>%</small></dd>
        <span class="bar is-version"><i :style="{ width: 侵渊.支配版图 + '%' }"></i></span>
        <span class="sub">{{ 名册已堕 }} / {{ 名册总数 }} 名少女归位</span>
      </div>

      <div class="gauge is-counter">
        <dt>艾尔戈物质</dt>
        <dd class="metric ergo">{{ 侵渊.艾尔戈物质 }}<small>单位</small></dd>
        <span class="sub">生态部件储备</span>
      </div>
    </dl>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 已堕落, 侵蚀时段, 侵渊阶段 } from '../../../derived';
import { useDataStore } from '../store';

const 数据 = useDataStore().data;
const 侵渊 = computed(() => 数据.侵渊);
const 领域 = computed(() => 数据.领域);

const 阶段 = computed(() => 侵渊阶段(侵渊.value.支配版图));
const 时段 = computed(() => 侵蚀时段(领域.value.侵蚀进度));
const 名册总数 = computed(() => _(数据.圣辉少女).size());
const 名册已堕 = computed(() =>
  _(数据.圣辉少女)
    .values()
    .filter(少女 => 已堕落(少女.侵蚀度))
    .size(),
);
</script>

<style lang="scss" scoped>
.abyss-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--c-border);
  background: linear-gradient(120deg, #1b0a24, var(--c-surface-2) 60%);
}

.identity {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1 1 190px;
}

.sigil {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 50%, var(--c-danger) 0 18%, transparent 19%),
    conic-gradient(from 45deg, var(--c-taint), var(--c-danger), var(--c-taint));
  box-shadow: 0 0 10px rgba(176, 38, 255, 0.5);
}

.labels {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.kind {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--c-text-muted);
}

.stage {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-danger);
}

.gauges {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  flex: 2 1 300px;
}

.gauge {
  display: grid;
  grid-template-columns: auto auto;
  align-items: baseline;
  column-gap: 6px;
  min-width: 108px;
  flex: 1 1 108px;

  dt {
    grid-column: 1 / -1;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--c-text-muted);
  }

  dd {
    font-size: 14px;

    small {
      margin-left: 1px;
      font-size: 9px;
      color: var(--c-text-muted);
    }
  }

  .sub {
    font-size: 10px;
    color: var(--c-text-muted);
    text-align: right;
  }

  &.is-counter {
    grid-template-columns: auto;
  }
}

.bar {
  grid-column: 1 / -1;
  display: block;
  height: 4px;
  margin: 3px 0 2px;
  border-radius: 999px;
  background: var(--c-surface-3);
  overflow: hidden;

  i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, var(--c-taint), var(--c-danger));
    transition: width 0.5s;
  }

  &.is-version i {
    background: linear-gradient(90deg, var(--c-holy-accent), var(--c-taint));
  }
}

.metric {
  font-family: var(--font-metric);
  font-variant-numeric: tabular-nums;

  &.ergo {
    color: var(--c-ergo);
  }
}
</style>
