<!-- <script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'IndexPage',
})

const response = ref<ResponseState>(null)
function setResponse(data: ResponseState) {
  response.value = data
}

const user = useUserStore()
const router = useRouter()
function go() {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name)}`)
}

const { t } = useI18n()

const feedUrl = ref('https://www.flourish.org/flickr/daily-interesting-one.xml')
const name = ref('hashnode.com')
const limit = ref(100)
</script> -->

<!-- <template>
  <div>
    <div text-4xl>
      <div i-carbon-campsite inline-block />
    </div>
    <p>
      <a rel="noreferrer" href="https://github.com/antfu/vitesse" target="_blank">
        Vitesse
      </a>
    </p>
    <FeedSearch :feed-url="feedUrl" :name="name" :limit="limit" :load-more="true" />

    <p>
      <em text-sm opacity-75>{{ t('intro.desc') }}</em>
    </p>

    <div py-4 />

    <h3 v-if="response && 'error' in response" class="error">
      {{ response.error }}
    </h3>
    <SortableList
      v-if="response && 'feed' in response"
      :title="response.feed.title"
      :feed="response.items"
    />

    <label class="hidden" for="input">
{{ t('intro.whats-your-name') }}
</label>

    <div>
      <button
        m-3 text-sm btn
        :disabled="!name"
        @click="go"
      >
        {{ t('button.go') }}
      </button>
    </div>
  </div>
</template> -->

<!-- <route lang="yaml">
meta:
  layout: home
</route> -->

<!-- <style>
body {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  line-height: 1.15;
  margin: 0;
  color: $primary-text-color;
}

header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: $base-margin;
  background: $brand-color;
  color: $brand-text-color;
}

main {
  margin: $base-margin;
}

h1 {
  text-align: center;
  margin: 0 0 $base-margin;
}

a {
  display: inline-block;
  color: $brand-color;
  text-decoration: none;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
}

button,
.button {
  cursor: pointer;
  display: inline-block;
  font-size: $medium-font-size;
  padding: $small-margin $base-margin;
  background: $brand-color;
  color: $brand-text-color;
  border-radius: 2px;
  border: 0;

  &:hover,
  &:focus {
    opacity: 0.9;
  }

  &:active,
  &:focus {
    outline: none;
  }
}

@media only screen and (min-width: 768px) {
  header {
    flex-direction: row;

    h1 {
      text-align: left;
      margin: 0;
    }
  }
}
</style> -->

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const user = useUserStore()

const boostedFeeds = ref([])

onMounted(async () => {
  user.getExchangeRate()
  const test = await getBoostedFeeds()
  console.log('test', test)
})

const response = ref<ResponseState>(null)
function setResponse(data: ResponseState) {
  response.value = data
}

function cleanString(input: string) {
  let output = ''
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) <= 127)
      output += input.charAt(i)
  }
  return output
}

// test the response
function getBoostedFeeds() {
  fetch('https://pow.co/api/v1/boost/rankings?start_date=1680220658&tag=706f77636f2e727373').then((data) => {
    console.log('data', data)
    const response = data.json()
    return response
  }).then(async (response) => {
    console.log('response', response)
    // Get the data for the first 10 items in response.rankings
    const topTenBoostedFeeds = response.rankings.slice(0, 10)

    // Get the content from each feed from the powco api, return the results not an array of promises
    const boostedFeedData = await Promise.all(topTenBoostedFeeds.map(async (feed) => {
      const feedResponse = await fetch(`https://pow.co/api/v1/content/${feed.content_txid}`)
      const feedData = await feedResponse.json()
      return feedData
    }))
    console.log('boostedFeedData', boostedFeedData)
    boostedFeeds.value = boostedFeedData
    return boostedFeedData
  })
}

function setBoostedFeed(feed) {
  console.log('setBoostedFeed', feed)
  boostedFeed.value = feed.content?.content_text ? feed.content.content_text : feed?.content.content_json?.url
}

const boostedFeed = ref(null)
</script>

<template>
  <header>
    <h1 my-auto text-lg prose md:text-3xl>
      POWCO News
    </h1>
    <FeedSearch :boosted-feed="boostedFeed" @response="response = $event" />
  </header>
  <main>
    <h3 v-if="response && 'error' in response" class="error">
      {{ response.error }}
    </h3>
    <div
      class="mx-auto my-4 h-full w-full flex flex-col items-start justify-center rounded-lg bg-white p-4 shadow-md md:flex-row md:justify-around dark:bg-gray-800 md:shadow-xl"
    >
      <SortableList v-if="response && 'feed' in response" :title="response.feed.title" :feed="response.items" />
      <!-- A card that has a list of trending RSS feeds  -->

      <div
        class="w-2/5 flex flex-col items-center justify-center border-2 text-center md:flex-row md:flex-wrap md:items-start md:space-x-6"
      >
        <div class="w-full flex flex-col space-y-2">
          <h2 class="text-2xl font-medium text-gray-800 md:text-3xl dark:text-white">
            Trending RSS Feeds
          </h2>
          <p class="text-gray-500 dark:text-gray-300">
            Top 10 boosted RSS feeds using the
            <span
              class="font-medium text-pink-600 dark:text-white"
            >
              `powco.rss`
            </span>tag
          </p>
        </div>
        <!-- The list of RSS feeds -->
        <div
          class="flex flex-col items-center justify-center md:mt-4 md:flex-row md:items-start space-y-4 md:space-x-6 md:space-y-0"
        >
          <ul>
            <li
              v-for="feed in boostedFeeds"
              :key="feed.content.id"
              class="flex flex-col cursor-pointer items-center justify-center md:flex-row md:items-start space-y-4 md:space-x-6 md:space-y-0"
              @click="setBoostedFeed(feed)"
            >
              <a v-if="feed.image" :href="feed.url" target="_blank" rel="noopener noreferrer">
                <img :src="feed.image" class="h-20 w-20 rounded-full">
              </a>
              <div class="flex flex-col space-y-2">
                <h2 class="text-2xl font-medium text-gray-800 md:text-lg dark:text-white">
                  {{ feed.content.content_text ? feed.content.content_text : feed?.content?.content_json?.url }}
                </h2>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="scss">
@import-normalize;
@import url("https://fonts.googleapis.com/css?family=Roboto");
@import "../style/variables";
@import "../style/utils";

body {
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  line-height: 1.15;
  margin: 0;
  color: $primary-text-color;
}

header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: $base-margin;
  background: $brand-color;
  color: $brand-text-color;
}

main {
  margin: $base-margin;
}

h1 {
  text-align: center;
  margin: 0 0 $base-margin;
}

a {
  display: inline-block;
  color: $brand-color;
  text-decoration: none;

  &:hover,
  &:focus {
    opacity: 0.7;
  }
}

button,
.button {
  cursor: pointer;
  display: inline-block;
  font-size: $medium-font-size;
  padding: $small-margin $base-margin;
  background: $brand-color;
  color: $brand-text-color;
  border-radius: 2px;
  border: 0;

  &:hover,
  &:focus {
    opacity: 0.9;
  }

  &:active,
  &:focus {
    outline: none;
  }
}

@media only screen and (min-width: 768px) {
  header {
    flex-direction: row;

    h1 {
      text-align: left;
      margin: 0;
    }
  }
}
</style>
