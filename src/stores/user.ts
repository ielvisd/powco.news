import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  /**
   * Current name of the user.
   */
  const savedName = ref('')
  const previousNames = ref(new Set<string>())
  const exchangeRate = ref(0)

  const usedNames = computed(() => Array.from(previousNames.value))
  const otherNames = computed(() => usedNames.value.filter(name => name !== savedName.value))

  // Boosted Feeds
  const boostedFeeds = ref([])

  /**
   *
   * Changes the current name of the user and saves the one that was used
   * before.
   *
   * @param name - new name to set
   */
  function setNewName(name: string) {
    if (savedName.value)
      previousNames.value.add(savedName.value)

    savedName.value = name
  }

  // TODO: Move this to the store. Also, use the store to set the default in feedHistory
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

  async function getExchangeRate() {
    const exchangeRateResponse = await fetch('https://api.whatsonchain.com/v1/bsv/main/exchangerate')

    const data = await exchangeRateResponse.json()
    // round to w decimals
    exchangeRate.value = data.rate.toFixed(2)
  }

  return {
    setNewName,
    otherNames,
    savedName,
    exchangeRate,
    getExchangeRate,
    boostedFeeds,
    getBoostedFeeds,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
