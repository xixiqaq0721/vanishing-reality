<template>
  <button
    type="button"
    class="maiden"
    :class="{ 'is-fallen': 已堕, 'is-flipped': flipped }"
    :title="原作 ? '原作角色' : '扩展角色（非原作设定）'"
    @click="flipped = !flipped"
  >
    <div class="faces">
      <!-- 正面：圣辉形态 -->
      <div class="face face-holy">
        <header class="head">
          <span class="emblem" aria-hidden="true"></span>
          <span class="titles">
            <span class="order">{{ 少女.称号 }}</span>
            <span class="form">{{ 少女.形态名 }}</span>
          </span>
          <span class="stage" :data-stage="阶段.名">{{ 阶段.名 }}</span>
        </header>

        <p class="note">{{ 阶段.注 }}</p>

        <dl class="stats">
          <div class="stat">
            <dt>侵蚀度</dt>
            <dd class="metric">{{ 少女.侵蚀度 }}<small>%</small></dd>
          </div>
          <div class="stat">
            <dt>圣辉余量</dt>
            <dd class="metric">{{ 少女.圣辉余量 }}<small>%</small></dd>
          </div>
        </dl>

        <div class="meter" role="img" :aria-label="`侵蚀度 ${少女.侵蚀度}%`">
          <span class="meter-fill" :style="{ width: 少女.侵蚀度 + '%' }"></span>
        </div>

        <dl class="details">
          <div>
            <dt>真名</dt>
            <dd :class="{ unknown: !已识破 }">{{ 已识破 ? 少女.真名 : '未识破' }}</dd>
          </div>
          <div>
            <dt>武装</dt>
            <dd>{{ 少女.武器 }}</dd>
          </div>
          <div>
            <dt>星徽</dt>
            <dd>{{ 少女.星徽 }}</dd>
          </div>
          <div>
            <dt>在播观众</dt>
            <dd class="metric audience">{{ 观众文本 }}</dd>
          </div>
        </dl>
      </div>

      <!-- 背面：魔娼形态 -->
      <div class="face face-abyss">
        <header class="head">
          <span class="emblem is-cracked" aria-hidden="true"></span>
          <span class="titles">
            <span class="order">{{ 魔娼称号 }}</span>
            <span class="form">{{ 少女.灾祸名 }}</span>
          </span>
          <span class="stage is-abyss">灾祸</span>
        </header>

        <p class="note">名号已改写。往后她替你收欲望，观众听不出区别。</p>

        <dl class="stats">
          <div class="stat">
            <dt>支配度</dt>
            <dd class="metric">{{ 支配度 }}<small>%</small></dd>
          </div>
          <div class="stat">
            <dt>已收欲望</dt>
            <dd class="metric">{{ 收割量 }}<small>单位</small></dd>
          </div>
        </dl>

        <div class="meter is-abyss" role="img" :aria-label="`支配度 ${支配度}%`">
          <span class="meter-fill" :style="{ width: 支配度 + '%' }"></span>
        </div>

        <dl class="details">
          <div>
            <dt>原形</dt>
            <dd>{{ 少女.形态名 }}</dd>
          </div>
          <div>
            <dt>使徒职</dt>
            <dd>魔娼使徒 · 灾祸少女</dd>
          </div>
          <div>
            <dt>归属</dt>
            <dd>侵渊魔 · 佐默系</dd>
          </div>
          <div>
            <dt>在播观众</dt>
            <dd class="metric audience">{{ 观众文本 }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { 原作角色, 灾祸线, 堕落阶段 } from '../../../derived';

const props = defineProps<{
  少女: {
    称号: string;
    形态名: string;
    灾祸名: string;
    真名: string;
    武器: string;
    星徽: string;
    侵蚀度: number;
    圣辉余量: number;
    观众: number;
  };
}>();

const 阶段 = computed(() => 堕落阶段(props.少女.侵蚀度));
const 已堕 = computed(() => props.少女.侵蚀度 >= 灾祸线);
/** 侵染过半才算查清中之人，此前名册上只有代号。 */
const 已识破 = computed(() => props.少女.侵蚀度 >= 20);
const 原作 = computed(() => 原作角色.has(props.少女.形态名));

const 支配度 = computed(() => _.clamp(100 - props.少女.圣辉余量, 0, 100));
const 收割量 = computed(() => Math.round((支配度.value * props.少女.观众) / 1000));
const 观众文本 = computed(() => props.少女.观众.toLocaleString('en-US'));

/** 魔娼称号：把圣辉称号的「◯◯◯星」换成对应的魔娼前缀。 */
const 魔娼称号 = computed(() => {
  const 表: Record<string, string> = {
    乙女银星: '淫星魔娼',
    少女奏星: '艳星魔娼',
    宵暗夜星: '闇星魔娼',
    晓光晨星: '灼星魔娼',
  };
  return 表[props.少女.称号] ?? '魔娼';
});

// 初始朝向跟着状态走；跨过灾祸线时自动翻面一次，之后由玩家自己翻。
const flipped = ref(已堕.value);
watch(已堕, (now, before) => {
  if (!before && now) flipped.value = true;
});
</script>

<style lang="scss" scoped>
.maiden {
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  background: var(--c-surface-2);
  color: var(--c-text);
  font-family: var(--font-body);
  text-align: left;
  cursor: pointer;
  perspective: 1200px;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;

  &:hover,
  &:focus-visible {
    border-color: var(--c-taint);
    box-shadow: 0 0 0 1px var(--c-taint);
    outline: none;
  }

  &.is-fallen {
    border-color: var(--c-danger);
  }
}

/* 两面同占一个网格单元：容器高度取较高的一面，不脱离文档流。 */
.faces {
  display: grid;
  transform-style: preserve-3d;
  transition: transform 0.62s cubic-bezier(0.34, 1.16, 0.5, 1);
}

.maiden.is-flipped .faces {
  transform: rotateY(180deg);
}

.face {
  grid-area: 1 / 1;
  padding: 10px;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-radius: 9px;
}

.face-holy {
  background: linear-gradient(160deg, var(--c-surface-2), #2c1a3f 70%);
}

.face-abyss {
  transform: rotateY(180deg);
  background: linear-gradient(160deg, #2a0a22, var(--c-surface) 72%);
}

.head {
  display: flex;
  align-items: center;
  gap: 7px;
}

.titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.order {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--c-text-muted);
}

.form {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.stage {
  flex: none;
  padding: 2px 6px;
  border: 1px solid currentcolor;
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--c-holy-accent);

  &[data-stage='侵染'] {
    color: var(--c-taint);
  }

  &[data-stage='堕转'] {
    color: var(--c-danger);
  }

  &.is-abyss {
    color: var(--c-danger);
    background: rgba(255, 61, 110, 0.12);
  }
}

/* 星徽：圣辉态是完整菱形，魔娼态裂开一道。 */
.emblem {
  flex: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, var(--c-holy), var(--c-holy-accent));
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);

  &.is-cracked {
    background: linear-gradient(135deg, var(--c-danger), var(--c-taint));
    clip-path: polygon(50% 0%, 100% 50%, 50% 62%, 20% 100%, 0% 50%);
  }
}

.note {
  font-size: 11px;
  line-height: 1.45;
  color: var(--c-text-muted);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.stat dt,
.details dt {
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--c-text-muted);
}

.stat dd {
  font-size: 13px;
}

.metric {
  font-family: var(--font-metric);
  font-variant-numeric: tabular-nums;

  small {
    margin-left: 1px;
    font-size: 9px;
    color: var(--c-text-muted);
  }

  &.audience {
    color: var(--c-audience);
  }
}

.meter {
  height: 5px;
  border-radius: 999px;
  background: var(--c-surface-3);
  overflow: hidden;

  &.is-abyss .meter-fill {
    background: linear-gradient(90deg, var(--c-taint), var(--c-danger));
  }
}

.meter-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--c-holy-accent), var(--c-taint));
  transition: width 0.5s;
}

.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 8px;

  dd {
    font-size: 11px;
    overflow-wrap: anywhere;
  }

  .unknown {
    color: var(--c-text-muted);
    font-style: italic;
  }
}

@media (max-width: 420px) {
  .details,
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
