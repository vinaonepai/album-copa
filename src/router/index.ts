import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { authReady, useAuth } from '@/composables/useAuth'
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
  path: '/',
  redirect: '/login'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/cadastro',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/recuperar-senha',
    component: () => import('@/views/ResetPasswordPage.vue')
  },
  {
  path: '/tabs',
  component: TabsPage,
  children: [
    {
      path: '',
      redirect: '/tabs/album'
    },
    {
      path: 'album',
      component: () => import('@/views/AlbumPage.vue')
    },
    {
      path: 'conquistas',
      component: () => import('@/views/AchievementsPage.vue')
    },
    {
      path: 'estatisticas',
      component: () => import('@/views/StatisticsPage.vue')
    },
    {
      path: 'perfil',
      component: () => import('@/views/ProfilePage.vue')
    },
    {
      path: 'sobre',
      component: () => import('@/views/AboutPage.vue')
    }
  ]
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  await authReady

  const { usuarioLogado } = useAuth()
  const isLogged = Boolean(usuarioLogado.value?.id)

  if (to.path.startsWith('/tabs') && !isLogged) {
    return '/login'
  }

  if (to.path === '/login' && isLogged) {
    return '/tabs/album'
  }
})

export default router
