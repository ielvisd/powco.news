<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { wrapRelayx } from 'stag-relayx'

const props = defineProps({
  href: {
    required: false,
    type: String,
    default: null,
  },
  type: {
    type: String,
    default: 'button', // button, submit
  },
  content: {
    type: String,
    required: true,
  },
  ranks: {
    type: Array,
    required: false,
    default: () => [],
  },
  tag: {
    type: String,
    default: null,
  },
  onSending: {
    type: Function,
    default: null,
  },
  onSuccess: {
    type: Function,
    default: null,
  },
  onError: {
    type: Function,
    default: null,
  },
  onClick: {
    type: Function,
    default: null,
  },
  id: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  outline: Boolean,
  icon: Boolean,
  round: Boolean,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const user = useUserStore()

function emitClose() {
  return emit('close')
}

const defaultPricePerDifficulty = 2.18
const boostSpeed = ref(50)

// If the content has a difficulty level don't set a tag, otherwise set the tag to 'powco-show'
const tag = ref(props.tag || (props.content.includes('difficulty') ? null : 'powco.news'))
const difficulty = ref(0.00025)
const estimatedRank = ref(
  props.ranks.findIndex((rank: any) => rank.difficulty < difficulty.value) + 1,
)
const totalPriceInUSD = ref<number>(defaultPricePerDifficulty * difficulty.value + (defaultPricePerDifficulty * difficulty.value * boostSpeed.value / 100) * 1.1)

const totalPriceInSatoshis = computed<number>(() => (totalPriceInUSD.value * 1e8 / user.exchangeRate).toFixed(0))

const devFee = computed<number>(() => (totalPriceInSatoshis.value * 0.1))

watch([difficulty, boostSpeed], ([newDifficulty, newBoostSpeed], [prevDifficulty, prevBoostSpeed]) => {
  totalPriceInUSD.value = defaultPricePerDifficulty * newDifficulty + (defaultPricePerDifficulty * newDifficulty * newBoostSpeed / 100) * 1.1
  // If the difficulty is the same as the previous difficulty, then the rank should be the same as the previous rank. Otherwise, the rank should be the index in which the difficulty would be inserted in the ranks array which is sorted from highest to lowest difficulty. If it is equal to the current difficulty then it is the current rank. The index is 1 based so we add 1 to it.

  let index = props.ranks.findIndex((rank: any) => rank.difficulty <= newDifficulty)

  // if index = -1, set it to the length of the ranks array
  index = index === -1 ? props.ranks.length : index

  estimatedRank.value = newDifficulty === prevDifficulty ? estimatedRank.value : index + 1
})

watch([estimatedRank], ([newRank], [prevRank]) => {
  if (difficulty.value && props?.ranks.length) {
    // If the newRank is larger than the length of the ranks array, then the difficulty should be the last difficulty in the ranks array. Otherwise, the difficulty should be the difficulty of the rank that was selected.
    difficulty.value = newRank > props?.ranks?.length ? props.ranks[props.ranks.length - 1].difficulty : props.ranks[newRank - 1].difficulty
  }
})

// To get the injected content from plugin initialization
// TODO: Make the other props available as well
// const injectedContent = inject('content') as string
// const contentToBoost = injectedContent ?? props.content
async function boost() {
  // const bsocial = new BSocial('pow.co');

  // const post = bsocial.post();

  // post.addText(props.content)

  // if (signWithPaymail) {
  //   post.addMapData('paymail', paymail)
  // }

  // const hexArrayOps = post.getOps('hex');

  // const opReturn = signOpReturn(hexArrayOps)

  // console.log('opReturn', opReturn, hexArrayOps, props.content, post)
  // Get the txid by removing the utxo from the token contract
  // const contentTxid = props?.content.substring(0, props?.content.indexOf('_'));
  // eslint-disable-next-line no-async-promise-executor
  const promise = new Promise(async (resolve, reject) => {
    // Make a post with the URL if a txid is not provided
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const stag = wrapRelayx(relayone)

    try {
      if (props.onSending)
        props.onSending()

      if (!props?.content?.content?.txid) {
        const [result, isNew] = await stag.onchain.findOrCreate({
          where: {
            app: 'pow.co',
            type: 'url',
            content: {
              url: props.content,
            },
          },
          defaults: {
            app: 'pow.co',
            type: 'url',
            content: {
              url: props.content,
            },
          },
        })

        await stag.boost.buy({
          content: result.txid,
          difficulty: difficulty.value,
          value: totalPriceInSatoshis.value,
          tag: tag.value,
        })
      }
      else {
        await stag.boost.buy({
          content: props?.content?.content?.txid,
          difficulty: difficulty.value,
          value: totalPriceInSatoshis.value,
          tag: tag.value,
        })
      }

      if (props.onSuccess)
        props.onSuccess({ txid: result.txid })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      relayone
        .send({
          currency: 'BSV',
          amount: devFee.value * 1e-8,
          to: '15etMzuXHaEFuoaKCt5gw16LYGrLX7iKKj', // ielvis Twetch address for testing
        })
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          console.error('relayone.send.reward.error', error)
          reject(error)
        })
    }
    catch (error) {
      console.error('relayx', error)
      if (props.onError) {
        $q.loading.hide()
        props.onError(error)
        reject(error)
      }
      if (stag.relayone!.errors.isLowFunds(error)) {
        props.onError(error)
        reject(error)
      }
    }
  })

  if (props.onClick)
    props.onClick(promise)
}

const closeButton = ref<HTMLElement | null>(null)
onMounted(() => {
  closeButton.value?.focus()
})
</script>

<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<template>
  <Teleport to="body">
    <div class="modal">
      <div class="modal__backdrop" @click="$emit('close')" />
      <dialog
        class="modal__dialog rounded-xl bg-white text-black" :aria-label="props.content" role="alertdialog" aria-modal="true" open
        @keyup.esc.prevent="$emit('close')"
      >
        <button ref="closeButton" class="modal__close text-xl btn" type="button" @click="emitClose">
          &times;
        </button>
        <div>
          <div class="q-pa-md boostpow-dialog w-full text-center md:w-md">
            <div class="mb-4 flex items-center">
              <span
                class="pulse focus:shadow-outline flex cursor-pointer items-center text-3xl font-medium shadow hover:shadow-lg focus:outline-none"
              >🦚</span>
              <div class="font-bolder ml-2 text-lg font-medium">
                Boostpow
              </div>
              <div class="ml-auto flex flex-row items-center justify-center">
                <label class="mb-1 block font-medium">Rank</label>
                <input
                  v-model="estimatedRank" min="1" :max="ranks.length" outlined type="number"
                  class="ml-2 w-16 rounded-md bg-gray-100 text-center text-gray-500"
                >
              </div>
            </div>

            <div class="mx-auto mb-4 w-36">
              <label class="mb-1 block font-medium">Tag</label>
              <input v-model="tag" outlined class="rounded-md bg-gray-100">
            </div>
            <div class="mx-auto mb-4 w-36">
              <label class="mb-1 block font-medium">Difficulty</label>
              <input
                v-model.number="difficulty" min="0.0001" step="0.0005" outlined type="number" class="rounded-md bg-gray-100"
                :rules="[val => val > 0.00001 || 'Minimum difficulty is 0.00001']"
              >
            </div>
            <div class="mb-4">
              <label class="mb-1 block font-medium">Boost Speed {{ boostSpeed }}</label>
              <div class="flex items-center justify-center">
                <span class="text-lg text-gray-500">🐢</span>
                <!-- The input should have a min of 1 and a max of 100 -->
                <input
                  v-model.number="boostSpeed" class="mx-4 w-7/10 accent-pink-600"
                  type="range" min="1" max="100" step="1"
                >
                <span class="text-lg text-gray-500">🐇</span>
              </div>
            </div>

            <button
              v-if="totalPriceInUSD >= 0.01" class="mb-4 btn" color="primary"
              @click="boost"
            >
              <p>
                {{ `Buy Boost $${totalPriceInUSD} ` }}
              </p>
            </button>

            <button
              v-else class="mb-4 btn" color="primary"
              @click="boost"
            >
              <p>
                {{ `Buy Boost ${totalPriceInSatoshis} satoshis` }}
              </p>
            </button>

            <div class="text-sm text-gray-500">
              *developer fee: 10%
            </div>
          </div>
        </div>
      </dialog>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
@import "../style/variables";

.pulse {
  cursor: pointer;
  border-radius: 100%;
  box-shadow: 0 0 0 0 rgba(107, 156, 250, 1);
}

.pulse:hover {
  transform: scale(1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(107, 156, 250, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(107, 156, 250, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(107, 156, 250, 0);
  }
}

.boostpow-dialog {
  padding: 10px;
  min-height: 250px;
}

.boostpow-header {
  display: flex;
  align-items: center;
}

.boostpow-title {
  margin-left: 10px;
  font-size: 1.5rem;
}

.boostpow-slider {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.boostpow-slider .input__label.turtle:before {
  content: '🐢';
}

.boostpow-slider .input__label.rabbit:before {
  content: '🐇';
}

.boostpow-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.boostpow-devfee {
  font-size: 0.75rem;
}
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
  width: auto;
  height: auto;
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
