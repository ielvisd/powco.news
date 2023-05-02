<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useFetch } from '../composables/useFetch'
import { addHistoryItem, getHistory } from '../utils/feedHistory'
import SearchInput from './SearchInput.vue'

export default defineComponent({
  name: 'FeedSearch',
  components: {
    SearchInput,
  },
  props: ['boostedFeed'],
  emits: {
    response: (data: ResponseState) => data !== undefined,
  },
  setup(props, { emit }) {
    const user = useUserStore()
    const url = ref(getHistory()[0]?.url)

    if (!url.value && user.boostedFeeds)
      url.value = user.boostedFeeds[0]?.content?.content_text ? user.boostedFeeds[0]?.content?.content_text : user.boostedFeeds[0]?.content?.content_json?.url

    else
      url.value = 'https://www.reddit.com/.rss'

    // TODO: Use rss-parser instead of rss2json
    const feedUrl = computed(() => `https://api.rss2json.com/v1/api.json?rss_url=${url.value}`)
    const response = useFetch(feedUrl)

    watch([response, () => props.boostedFeed], ([newResponse, newBoostFeed]) => {
      console.log('newResponse', newResponse, 'newBoostFeed', newBoostFeed)
      if (props.boostedFeed) {
        url.value = props.boostedFeed

        emit('response', response.value)
        if (props.boostedFeed.value && 'feed' in props.boostedFeed.value)
          addHistoryItem(props.boostedFeed.value.feed)
      }
      else {
        emit('response', response.value)
        if (response.value && 'feed' in response.value)
          addHistoryItem(response.value.feed)
      }
    },

    )

    return { url, response }
  },
})
</script>

<template>
  <form name="feed search form" class="feed-search" @submit.prevent="url = $event.target[0].value">
    <SearchInput @submit="url = $event" />
    <span
      v-if="response === null" class="spinner" role="progressbar" aria-valuetext="loading" aria-busy="true"
      aria-live="assertive"
    />
    <button v-else class="feed-search__button">
      &#x276F;
    </button>
  </form>
</template>

<style lang="scss" scoped>
@import "../style/variables";

.feed-search {
  display: flex;
  align-items: center;
}

.feed-search__button {
  background: none;
  font-size: $large-font-size;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 100%;

  &:hover,
  &:focus {
    background: $active-color;
  }
}
</style>
