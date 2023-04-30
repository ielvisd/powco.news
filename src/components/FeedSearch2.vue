<script>
import Parser from 'rss-parser'
import { getWithExpiry, setWithExpiry } from '../utils/HelperMixin'

// @see https://developers.cloudflare.com/workers/examples/cors-header-proxy
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'

const parser = new Parser({
  customFields: {
    item: ['cover_image'],
  },
})

export default {
  name: 'FeedSearch',

  props: {
    feedUrl: String,
    name: String,
    limit: Number,
    loadMore: Boolean,
  },

  data() {
    return {
      loading: true,
      error: '',
      feed: {},
    }
  },

  created() {
    const data = getWithExpiry('feed')

    if (!data)
      this.fetchData()
    else
      this.feed = data
  },

  methods: {
    async fetchData() {
      this.error = ''
      this.loading = true
      try {
        const data = await fetch(CORS_PROXY + this.feedUrl)
        if (data.ok) {
          const text = await data.text()
          await parser.parseString(text, (err, parsed) => {
            this.loading = false
            if (err) {
              this.error = `Error occurred while parsing RSS Feed ${err.toString()}`
            }
            else {
              this.feed = parsed
              setWithExpiry('feed', this.feed, this.feed.ttl * 60)
            }
          })
        }
        else {
          this.error = 'Error occurred while fetching the feed'
          this.loading = false
        }
      }
      catch (e) {
        if (e.toString() === 'TypeError: Failed to fetch')
          this.error = 'Error due to CORS policy'
        else
          this.error = e.toString()

        this.loading = false
      }
    },

    getArticles() {
      if (this.feed.items)
        return this.feed.items
    },
  },
}
</script>

<template>
  <div class="mx-auto my-2 max-w-5xl flex flex-col px-2 space-y-6">
    <!--    TODO: Add loader -->
    <Error v-if="error" :description="error" />
    <template v-else>
      <Article
        v-for="(article, index) of getArticles()"
        :key="index"
        :article="article"
      />
    </template>
  </div>
</template>
