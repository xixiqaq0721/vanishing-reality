<template>
  <section class="roster">
    <header class="roster-head">
      <h3>圣辉少女 · 名册</h3>
      <p class="tally">
        已堕落 <b class="metric">{{ 已堕数 }}</b> / {{ 名册次序.length }} · 合计在播观众
        <b class="metric audience">{{ 观众合计 }}</b>
      </p>
    </header>

    <div class="grid">
      <MaidenCard v-for="名 in 名册次序" :key="名" :少女="数据[名]" />
    </div>

    <p class="hint">
      <i class="fa-solid fa-arrows-rotate" aria-hidden="true"></i>
      点任意一张卡翻面，背面是她的魔娼形态。
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 名册次序, 灾祸线 } from '../../../derived';
import { useDataStore } from '../store';
import MaidenCard from './MaidenCard.vue';

const 数据 = useDataStore().data.圣辉少女;

const 已堕数 = computed(() =>
  _(数据)
    .values()
    .filter(少女 => 少女.侵蚀度 >= 灾祸线)
    .size(),
);
const 观众合计 = computed(() => _(数据).values().sumBy('观众').toLocaleString('en-US'));
</script>

<style lang="scss" scoped>
.roster-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 9px;

  h3 {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--c-holy);
  }
}

.tally {
  font-size: 11px;
  color: var(--c-text-muted);
  /* 窄屏时独占一行，否则会被 flex 挤到容器外面裁掉 */
  flex: 1 1 auto;
  min-width: 0;

  b {
    color: var(--c-text);
  }

  .audience {
    color: var(--c-audience);
  }
}

@media (max-width: 560px) {
  .tally {
    flex-basis: 100%;
  }
}

.grid {
  display: grid;
  /* 名册固定两列：4 位少女排成整齐的 2×2，翻面时高度也好对齐。 */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

@media (max-width: 520px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.hint {
  margin-top: 8px;
  font-size: 10px;
  color: var(--c-text-muted);

  i {
    margin-right: 4px;
  }
}

.metric {
  font-family: var(--font-metric);
  font-variant-numeric: tabular-nums;
}
</style>
