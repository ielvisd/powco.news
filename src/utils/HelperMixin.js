import truncate from 'lodash/truncate'

/**
 * Trim a string to a given length.
 *
 * @param string
 * @param length
 * @returns {string}
 */
export function trim(string, length = 70) {
  return truncate(string, {
    length: length + 2,
  })
}

export function capitalize(string) {
  if (!string)
    return ''
  string = string.toString()
  return string.toUpperCase()
}

export function capitalizeFirstLatter(string) {
  if (string.length < 1)
    return string

  return string.replace(/^./, string[0].toUpperCase())
}

export function setWithExpiry(key, value, ttlSec) {
  const now = new Date()

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value,
    expiry: now.getTime() + ttlSec * 1000,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key)

  // if the item doesn't exist, return null

  if (!itemStr) {
    console.log(`Not found: ${key}`)
    return null
  }

  const item = JSON.parse(itemStr)
  const now = new Date()

  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    console.warn(`Key ${key} are expired`, new Date(item.expiry).toString())
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key)
    return null
  }

  return item.value
}
