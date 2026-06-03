import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
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
        path: 'perfil',
        component: () => import('@/views/ProfilePage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router