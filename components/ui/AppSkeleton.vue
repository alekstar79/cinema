<template>
  <v-sheet class="skeleton-card mx-auto" elevation="2">
    <v-skeleton-loader
      class="custom-skeleton"
      type="image, article"
      boilerplate
    />
  </v-sheet>
</template>

<style scoped>
.skeleton-card {
  max-width: 350px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}
.custom-skeleton :deep(.v-skeleton-loader__image) {
  height: 200px;
}
.custom-skeleton :deep(.v-skeleton-loader__article) {
  height: 120px;
}
</style>
