<template>
  <div class="hud">
    <AbyssHeader />

    <nav class="tabs" role="tablist">
      <button
        v-for="页 in 页签"
        :key="页.id"
        type="button"
        role="tab"
        class="tab"
        :class="{ active: active === 页.id }"
        :aria-selected="active === 页.id"
        @click="active = 页.id"
      >
        <i :class="页.图标" aria-hidden="true"></i>
        <span>{{ 页.名 }}</span>
      </button>
    </nav>

    <div class="pane">
      <MaidenRoster v-if="active === 'roster'" />
      <PowerPanel v-else-if="active === 'power'" />
      <FieldPanel v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import AbyssHeader from './components/AbyssHeader.vue';
import FieldPanel from './components/FieldPanel.vue';
import MaidenRoster from './components/MaidenRoster.vue';
import PowerPanel from './components/PowerPanel.vue';

const 页签 = [
  { id: 'roster', 名: '少女名册', 图标: 'fa-solid fa-star' },
  { id: 'power', 名: '侵渊权能', 图标: 'fa-solid fa-hand-sparkles' },
  { id: 'field', 名: '领域现况', 图标: 'fa-solid fa-circle-half-stroke' },
] as const;

type 页签ID = (typeof 页签)[number]['id'];

// 记住上次看的那一页，重开聊天不用重新点。
const active = useLocalStorage<页签ID>('vanishing_reality:tab', 'roster');
</script>

<style lang="scss" scoped>
.hud {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  background: var(--c-surface);
  color: var(--c-text);
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-surface-2);
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 6px;
  border: none;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--c-text-muted);
  font-family: inherit;
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;

  &:hover {
    color: var(--c-text);
  }

  &.active {
    color: var(--c-holy);
    border-bottom-color: var(--c-danger);
  }

  i {
    font-size: 11px;
  }
}

.pane {
  padding: 11px 12px 13px;
  animation: rise 0.32s ease-out;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pane {
    animation: none;
  }
}
</style>
