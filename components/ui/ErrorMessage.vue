<template>
  <v-alert
    v-if="displayMessage"
    type="error"
    closable
    prominent
    @click:close="$emit('close')"
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-alert-circle" size="large" />
    </template>
    <div class="text-body-1">{{ displayMessage }}</div>
    <template v-slot:append>
      <v-btn color="error" variant="text" @click="$emit('retry')">
        Повторить
      </v-btn>
    </template>
  </v-alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  message: string | null
}>()

defineEmits<{
  (e: 'retry'): void
  (e: 'close'): void
}>()

const displayMessage = computed(() => {
  return props.message || 'An unknown error occurred'
})
</script>
