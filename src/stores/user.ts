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

  /**
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
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
