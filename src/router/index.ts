import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { HomePage } from '@/views/HomePage'
import { LoginPage } from '@/views/LoginPage';
import { FilesPage } from '@/views/FilesPage';
import { FileView } from '@/views/FileView';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/files',
    name: 'Files',
    component: FilesPage
  },
  {
    path: "/file/:id",
    name: "FileView",
    component: FileView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
