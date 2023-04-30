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

onMounted(() => {
  user.getExchangeRate()
})

const response = ref<ResponseState>(null)
function setResponse(data: ResponseState) {
  response.value = data
}
</script>

<template>
  <header>
    <h1 my-auto text-lg prose md:text-3xl>
      POWCO News
    </h1>
    <FeedSearch @response="response = $event" />
  </header>
  <main>
    <h3 v-if="response && 'error' in response" class="error">
      {{ response.error }}
    </h3>
    <SortableList v-if="response && 'feed' in response" :title="response.feed.title" :feed="response.items" />
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
