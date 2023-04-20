import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter);

const routes = [
        {
            path: '/home',
            name: 'Home',
            component: () => import('@/views/Home'),
            meta: {
                loginRequire: true
            },
            children: [
                {
                    path: 'dash-board',
                    name: 'DashBoard',
                    component: () => import('@/views/system/DashBoard'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'user-list',
                    name: 'UserList',
                    component: () => import('@/views/user/UserList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'pick-list',
                    name: 'PickList',
                    component: () => import('@/views/seat/PickList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'seat-list',
                    name: 'SeatList',
                    component: () => import('@/views/seat/SeatList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'schedule-list',
                    name: 'ScheduleList',
                    component: () => import('@/views/seat/ScheduleList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'appointment-list',
                    name: 'AppointmentList',
                    component: () => import('@/views/appointment/AppointmentList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'credit-list',
                    name: 'CreditList',
                    component: () => import('@/views/credit/CreditList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'book-list',
                    name: 'BookList',
                    component: () => import('@/views/book/BookList'),
                    meta: {
                        loginRequire: true
                    }
                },
                {
                    path: 'rental-list',
                    name: 'RentalList',
                    component: () => import('@/views/rental/RentalList'),
                    meta: {
                        loginRequire: true
                    }
                }
            ]
        },
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login')
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/Register')
        },
        {
            path: '/',
            redirect: '/login',
        }
      ];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

// 导航栏中用到了路由 防止重复点同一个菜单给出错误提示
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
};


export default router;
