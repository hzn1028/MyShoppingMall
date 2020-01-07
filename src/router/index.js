import Vue from 'vue'
import Router from 'vue-router'

import GoodsList from '@/views/GoodsList'
import Cart from '@/views/Cart'
import Address from '@/views/Address'
import OrderConfirm from '@/views/OrderConfirm'
import OrderSuccess from '@/views/OrderSuccess'

Vue.use(Router);

export default new Router({
  routes: [
    //商品列表页（路由）
    {
      path: '/',
      name: 'GoodsList',
      component:GoodsList
    },
    //购物车列表页（路由）
    {
      path: '/cart',
      name: 'Cart',
      component:Cart
    },
    //商品列表页（路由）
    {
      path: '/goods',
      name: 'GoodsList',
      component: GoodsList
    },
    //地址列表页（路由）
    {
      path: '/address',
      name: 'Address',
      component:Address
    },
    //确认订单页（路由）
    {
      path: '/orderConfirm',
      name: 'OrderConfirm',
      component:OrderConfirm
    },
    //下单成功页（路由）
    {
      path: '/orderSuccess',
      name: 'OrderSuccess',
      component:OrderSuccess
    }
  ]
})
