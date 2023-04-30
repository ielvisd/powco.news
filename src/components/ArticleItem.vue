<script>
export default {
  name: 'Article',
  props: ['article'],
  methods: {
    getDate() {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(this.article.isoDate).toLocaleDateString('en-US', options) // Saturday, September 17, 2016
    },
  },
}
</script>

<template>
  <a class="w-full" :href="article.link" target="_blank">
    <div class="my-4 flex flex-col space-y-3">
      <div class="text-2xl font-bold no-underline sm:text-4xl hover:underline">{{ article.title }}</div>
      <div
        v-if="article.content" class="w-full text-lg font-normal leading-normal sm:text-2xl sm:font-medium sm:leading-relaxed"
      >
        <p class="html-value" v-html="article.content" />
      </div>
      <div class="flex flex-col text-base font-normal sm:flex-row space-x-0 space-y-2 sm:space-x-2 sm:space-y-0">
        <div v-if="article.creator" class="flex flex-row space-x-2">
          <span>By</span>
          <p class="font-bold hover:underline">{{
            article.creator }}</p>
        </div>
        <div class="flex flex-row space-x-2">
          <span>on</span>
          <span class="font-bold">{{ getDate() }}</span>
        </div>
      </div>
      <img v-if="false" class="w-full" :src="article.cover_image || article.mediaContent.url" :alt="article.title">
      <!-- <div class="w-full text-lg font-medium leading-normal sm:text-2xl" v-html="trim(article.contentSnippet, 250)" /> -->
    </div>
  </a>
</template>
