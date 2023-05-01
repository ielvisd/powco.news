<script lang="ts">
import type { PropType } from 'vue'
import { computed, defineComponent, ref } from 'vue'
import ListItem from './ListItem.vue'
import Modal from './Modal.vue'

type SortField = 'title' | 'pubDate'
type SortDir = 'asc' | 'desc'

interface SortingState {
  field: SortField
  dir: SortDir
}

export default defineComponent({
  components: {
    ListItem,
    Modal,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    feed: {
      type: Array as PropType<FeedItem[]>,
      required: true,
    },
  },
  setup(props) {
    const activeItem = ref<FeedItem | null>(null)

    const sorting = ref<SortingState>({ field: 'pubDate', dir: 'asc' })
    const sortedFeed = computed<FeedItem[]>(() => {
      const _feed = props.feed.slice(0)
      const multiplier = sorting.value.dir === 'asc' ? 1 : -1
      if (sorting.value.field === 'title') {
        _feed.sort((a, b) => (a.title || '').localeCompare(b.title || '') * multiplier)
      }
      else if (sorting.value.field === 'pubDate') {
        _feed.sort(
          (a, b) => (new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()) * multiplier,
        )
      }
      return _feed
    })
    function sortBy(field: SortField) {
      sorting.value = { field, dir: sorting.value.dir === 'asc' ? 'desc' : 'asc' }
    }

    return { activeItem, sorting, sortedFeed, sortBy }
  },
})
</script>

<template>
  <div
    v-if="feed.length"
    class="border-2"
  >
    <div class="feed__header w-full">
      <h3 text-lg font-bold md:text-xl>
        {{ title }}
      </h3>
      <button class="feed__header-button btn" @click="sortBy('title')">
        Title {{ sorting.field === "title" ? (sorting.dir === "asc" ? "&darr;" : "&uarr;") : "" }}
      </button>
      <button class="feed__header-button btn" @click="sortBy('pubDate')">
        Date {{ sorting.field === "pubDate" ? (sorting.dir === "asc" ? "&darr;" : "&uarr;") : "" }}
      </button>
    </div>
    <ol class="feed__list">
      <ListItem v-for="item in sortedFeed" :key="item.guid" :item="item" @click="activeItem = item" />
    </ol>
  </div>

  <Modal v-if="activeItem" :item="activeItem" @close="activeItem = null" />
</template>

<style lang="scss" scoped>
@import "../style/variables";

.feed__header {
  display: flex;
  align-items: center;
  margin: $base-margin 0;

  h3 {
    flex: 1;
    margin: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

.feed__header-button {
  margin-left: $small-margin;
}

.feed__list {
  padding: 0;
  list-style: none;
  margin: 0;
  overflow-x: hidden;
}

.item-enter {
  transform: translateX(100%);
}

.item-leave-active {
  transition-timing-function: ease-in;
  transform: translateX(-100%);
}
</style>
