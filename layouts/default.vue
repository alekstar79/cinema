<template>
  <v-app>
    <app-header />
    <v-main class="main-content" style="padding-top: 64px">
      <v-container fluid class="px-4 px-sm-6 px-md-8 px-lg-10">
        <NuxtPage>
          <template #default="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <component :is="Component" />
            </transition>
          </template>
        </NuxtPage>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/themeStore'
import AppHeader from '~/layouts/AppHeader.vue'

const { initializeTheme } = useThemeStore()

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css'
    }
  ]
})

onMounted(initializeTheme)
</script>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.main-content {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.custom-select-menu {
  max-width: 300px;
  z-index: 1000 !important;
}
.custom-select-menu .v-list {
  border-radius: 12px;
  padding: 8px 0;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.custom-select-menu .v-list-item {
  margin: 4px 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.custom-select-menu .v-list-item:hover {
  background-color: rgba(44, 62, 80, 0.1); /* Primary color with transparency */
}
.custom-select-menu .v-list-item--active {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.v-card.filter-card {
  border-radius: 16px !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
  transition: box-shadow 0.2s;
}
.v-card.filter-card:hover {
  box-shadow: 0 8px 20px rgba(0,0,0,0.1) !important;
}

.filter-fields > * {
  margin-bottom: 16px;
}
.filter-fields > *:last-child {
  margin-bottom: 0;
}
</style>
