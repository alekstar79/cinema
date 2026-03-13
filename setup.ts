import { vi } from 'vitest'
import { config } from '@vue/test-utils'

config.global.components = {
  ...config.global.components,
  VApp: { template: '<div><slot /></div>' },
  VMain: { template: '<main><slot /></main>' },
  VContainer: { template: '<div class="v-container"><slot /></div>' },
  VRow: { template: '<div class="v-row"><slot /></div>' },
  VCol: { template: '<div class="v-col"><slot /></div>' },
  VCard: { template: '<div class="v-card"><slot /></div>' },
  VImg: { template: '<img :src="src" class="v-img" />', props: ['src'] },
  VCardTitle: { template: '<div class="v-card-title"><slot /></div>' },
  VCardSubtitle: { template: '<div class="v-card-subtitle"><slot /></div>' },
  VCardText: { template: '<div class="v-card-text"><slot /></div>' },
  VChip: { template: '<span class="v-chip"><slot /></span>' },
  VBtn: { template: '<button class="v-btn"><slot /></button>' },
  VAppBar: { template: '<div class="v-app-bar"><slot /></div>' },
  VAppBarTitle: { template: '<div class="v-app-bar-title"><slot /></div>' },
  VSpacer: { template: '<div class="v-spacer"></div>' },
  VTextField: { template: '<input class="v-text-field" />' },
  VAlert: {
    template: '<div class="v-alert"><div class="v-alert__content"><slot /></div><slot name="append"></slot><button class="v-alert__close" v-if="$props.closable">×</button></div>',
    props: ['closable']
  },
  VIcon: { template: '<i class="v-icon"><slot /></i>' },
  VPagination: { template: '<div class="v-pagination"><slot /></div>' },
  VSelect: { template: '<select class="v-select"><slot /></select>' },
  VList: { template: '<div class="v-list"><slot /></div>' },
  VListItem: { template: '<div class="v-list-item"><slot /></div>' },
  VListItemTitle: { template: '<div class="v-list-item-title"><slot /></div>' },
  VDivider: { template: '<hr class="v-divider" />' },
  VSkeletonLoader: { template: '<div class="v-skeleton-loader"><slot /></div>' },
  NuxtLink: { template: '<a :href="to"><slot /></a>', props: ['to'] },
}

vi.stubGlobal('useRuntimeConfig', () => ({
  public: { apiBaseUrl: '/api' }
}))

vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: { apiBaseUrl: '/api' }
  }),
  useRouter: () => ({
    push: vi.fn()
  }),
  useAsyncData: vi.fn().mockReturnValue({
    data: vi.fn(),
    pending: vi.fn(),
    error: vi.fn()
  }),
  defineNuxtPlugin: (plugin: any) => plugin,
}))
