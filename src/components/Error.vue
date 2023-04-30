<script>
export default {
  name: 'Error',

  props: {
    description: String,
  },
}
</script>

<template>
  <div class="py-4 text-center lg:px-4">
    <div class="flex items-center bg-red-800 p-2 leading-none text-red-100 lg:inline-flex lg:rounded-full" role="alert">
      <span class="mr-3 flex rounded-full bg-red-500 px-2 py-1 text-xs font-bold uppercase">Error</span>
      <span class="mr-2 flex-auto text-left font-semibold">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
