<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<FeedItem>,
      default: null,
    },
  },
  emits: ['close'],
  setup() {
    const closeButton = ref<HTMLElement | null>(null)
    onMounted(() => {
      closeButton.value?.focus()
    })

    return { closeButton }
  },
})
</script>

<template>
  <teleport to="body">
    <div class="modal">
      <div class="modal__backdrop" @click="$emit('close')" />
      <dialog
        class="modal__dialog bg-white text-black" :aria-label="item.title" role="alertdialog" aria-modal="true" open
        @keyup.esc.prevent="$emit('close')"
      >
        <h2 class="modal__header">
          {{ item.title }}
        </h2>
        <button ref="closeButton" class="modal__close" type="button" @click="$emit('close')">
          &times;
        </button>

        <a class="button modal__action" :href="item.link" target="_blank" rel="noopener noreferrer">
          Read Full Story
        </a>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-if="item.description !== item.content" class="ultest" v-html="item.description" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="ultest" v-html="item.content" />
      </dialog>
    </div>
  </teleport>
</template>

<style lang="scss" scoped>
@import "../style/variables";
.ultest::v-deep li {
    display: list-item;
    text-align: -webkit-match-parent;
}

.ultest::v-deep ul {
  display: block;
  list-style-type: disc;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 40px;
}
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  padding: 5%;
}

.modal__backdrop {
  width: 100%;
  height: 100%;
  background: $shadow-color;
  position: absolute;
}

.modal__close {
  position: absolute;
  right: $base-margin;
  top: $base-margin;
  font-size: $large-font-size;
  line-height: 1rem;
  padding: 0;
  background: none;
  color: $primary-text-color;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
}

.modal__dialog {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: $base-margin;
  border: 0;
  margin: 0;

  .modal__header {
    margin-top: 0;
    margin-bottom: $base-margin;
    padding-right: $large-margin;
  }

  .modal__action {
    margin-bottom: $base-margin;
  }

  img {
    max-width: 100%;
    display: block;
    margin: 0 auto;
  }
}
</style>
