<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<FeedItem>,
      required: true,
    },
  },
  emits: ['click'],
  data() {
    return {
      showSuperBoost: false,
      exchangeRate: 0,
    }
  },
  computed: {
    firstParagraph(): string {
      const div = document.createElement('div')
      div.innerHTML = this.item.description
      if (!div.firstElementChild)
        return this.item.description

      return div.innerText.substring(0, 120)
    },
    buttonType(): string {
      if (this.item.href)
        return 'a'
      else
        return 'button'
    },
  },
  methods: {
    onBoostSuccess(txid) {
      // eslint-disable-next-line no-console
      console.log('boosted successfully, txid is: ', txid)
      alert('boosted successfully')
      this.showSuperBoost = false
    },
    async getExchangeRateAndShowSuperBoost() {
      const exchangeRateResponse = await fetch('https://api.whatsonchain.com/v1/bsv/main/exchangerate')

      const data = await exchangeRateResponse.json()

      // round to w decimals
      this.exchangeRate = data.rate.toFixed(2)
      this.showSuperBoost = true
    },
  },
})
</script>

<template>
  <li
    class="feed__item my-4 h-48 w-full overflow-hidden border-2 border-pink-600 rounded-lg p-4 md:w-4xl"
    tabIndex="0"
    role="button"
    @click="$emit('click')" @keypress.self.enter.space.prevent="$emit('click')"
  >
    <div flex items-start justify-center>
      <div>
        <div
          class="feed__item-title text-lg font-bold"
        >
          {{ item.title }}
        </div>
        <span class="feed__item-date"> {{ item.pubDate }}
        </span>

        <p class="feed__item-description" v-html="item.description" />
        <div />
      </div>
      <component
        :is="buttonType"
        class="pulse focus:shadow-outline flex cursor-pointer items-center font-medium shadow hover:shadow-lg focus:outline-none"
        @click.stop="getExchangeRateAndShowSuperBoost"
      >
        <p class="m-0 p-0 text-xl">
          🦚
        </p>
        <BoostButton
          v-if="showSuperBoost"
          :content="item.link"
          :on-success="onBoostSuccess"
          class="" size="sm" round :ranks="ranksWithBoost" outline @close="showSuperBoost = false"
        />
      </component>
    </div>
  </li>
</template>

<style lang="scss" scoped>
@import "../style/variables";

.feed__item {
  padding: $base-margin;
  cursor: pointer;
  outline: none;

  &:hover,
  &:focus {
    background: $active-color;
  }
}

.feed__item-date {
  font-size: $small-font-size;
}

.feed__item-description {
  margin: $small-margin 0 0;
}
</style>
