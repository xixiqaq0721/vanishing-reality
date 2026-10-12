<template>
  <section class="powers">
    <header class="powers-head">
      <h3>侵渊权能</h3>
      <p>等级随支配版图推进，逐项解锁。</p>
    </header>

    <ul class="list">
      <li v-for="项 in 权能次序" :key="项.键" class="power">
        <i :class="项.图标" aria-hidden="true"></i>
        <div class="body">
          <div class="row">
            <span class="name">{{ 项.键 }}</span>
            <span class="pips" :aria-label="`等级 ${等级(项.键)} / 5`" role="img">
              <b v-for="n in 5" :key="n" :class="{ on: n <= 等级(项.键) }"></b>
            </span>
          </div>
          <p class="desc">{{ 描述(项.键) }}</p>
        </div>
      </li>
    </ul>

    <footer class="rite">
      <span>
        堕落仪式：<b class="metric">{{ 已堕 }}</b> / {{ 总数 }} 名圣辉少女已改写名号
      </span>
      <span class="hint">侵蚀度满 {{ 灾祸线 }} 即完成改写</span>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 灾祸线, 权能次序 } from '../../../derived';
import { useDataStore } from '../store';

const 数据 = useDataStore().data;
/** 权能对象的键由 schema 固定，这里按字符串取用，缺失时退回空壳。 */
const 权能表 = computed(() => 数据.侵渊.权能 as unknown as Record<string, { 等级: number; 描述: string }>);

const 等级 = (键: string) => 权能表.value[键]?.等级 ?? 0;
const 描述 = (键: string) => 权能表.value[键]?.描述 ?? '';

const 总数 = computed(() => _(数据.圣辉少女).size());
const 已堕 = computed(() =>
  _(数据.圣辉少女)
    .values()
    .filter(少女 => 少女.侵蚀度 >= 灾祸线)
    .size(),
);
</script>

<style lang="scss" scoped>
.powers-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 9px;

  h3 {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: var(--c-holy);
  }

  p {
    font-size: 10px;
    color: var(--c-text-muted);
  }
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 8px;
  list-style: none;
}

.power {
  display: flex;
  gap: 9px;
  padding: 8px 10px;
  border: 1px solid var(--c-border);
  border-radius: 8px;
  background: var(--c-surface-2);

  > i {
    flex: none;
    margin-top: 2px;
    font-size: 13px;
    color: var(--c-taint);
  }
}

.body {
  min-width: 0;
  flex: 1;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.name {
  font-size: 12px;
  font-weight: 700;
}

.pips {
  display: inline-flex;
  gap: 2px;

  b {
    width: 8px;
    height: 3px;
    border-radius: 1px;
    background: var(--c-surface-3);

    &.on {
      background: var(--c-danger);
    }
  }
}

.desc {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.4;
  color: var(--c-text-muted);
}

.rite {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed var(--c-border);
  font-size: 11px;

  b {
    font-family: var(--font-metric);
    font-size: 14px;
    color: var(--c-danger);
  }

  .hint {
    color: var(--c-text-muted);
    font-size: 10px;
  }
}
</style>
