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
    function extractHostname(url: string): string | null {
      // Find the beginning of the hostname
      const protocolIndex = url.indexOf('://')
      if (protocolIndex < 0)
        return null // invalid URL

      const hostnameBegin = protocolIndex + 3

      // Find the end of the hostname
      const firstDotIndex = url.indexOf('.', hostnameBegin)
      const hostnameEnd = (firstDotIndex >= 0) ? firstDotIndex : url.length

      // Extract the hostname
      const hostname = url.substring(hostnameBegin, hostnameEnd)
      return hostname
    }

    const user = useUserStore()
    const url = ref(getHistory()[0]?.url)

    if (!url.value && user.boostedFeeds)
      url.value = user.boostedFeeds[0]?.content?.content_text ? user.boostedFeeds[0]?.content?.content_text : user.boostedFeeds[0]?.content?.content_json?.url

    // else
    //   url.value = 'https://nitter.net/proofofwork_co/rss'

    // TODO: Use rss-parser instead of rss2json
    const feedUrl = computed(() => `https://api.rss2json.com/v1/api.json?rss_url=${url.value}`)
    const response = useFetch(feedUrl)

    watch([response, () => props.boostedFeed], ([newResponse, newBoostFeed]) => {
      if (props.boostedFeed) {
        url.value = props.boostedFeed
        if (props.boostedFeed.value && 'feed' in props.boostedFeed.value) {
          emit('response', response.value)
          addHistoryItem(props.boostedFeed.value.feed)
        }
        else {
          const hostName = extractHostname(props.boostedFeed)
          const newBoostedFeed = {
            title: hostName,
            url: props.boostedFeed,
          }
          emit('response', response.value)
          addHistoryItem(newBoostedFeed)
        }
      }
      else {
        emit('response', response.value)
        if (response.value && 'feed' in response.value)
          addHistoryItem(response.value.feed)
      }
    })

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
