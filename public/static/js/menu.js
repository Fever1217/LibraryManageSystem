STUDENT_MENUS =  [
    {
        id: '1',
        icon: 's-home',
        name: '首页',
        url: '/home/dash-board'
    },
    {
        id: '2',
        icon: 'user',
        name: '用户管理',
        children: [
            {
                id: '2-1',
                url: "/home/user-list",
                name: "用户列表",
                icon: "document",
            }
        ]
    },
    {
        id: '3',
        icon: 'suitcase',
        name: '座位管理',
        children: [
            {
                id: '3-1',
                url: "/home/pick-list",
                name: "选座页面",
                icon: "document",
            }
        ]
    },
    {
        id: '4',
        icon: 'date',
        name: '预约管理',
        children: [
            {
                id: '4-1',
                url: "/home/appointment-list",
                name: "预约列表",
                icon: "document",
            }
        ]
    },
    {
        id: '6',
        icon: 'notebook-1',
        name: '图书管理',
        children: [
            {
                id: '6-1',
                url: "/home/book-list",
                name: "图书列表",
                icon: "document",
            }
        ]
    },
    {
        id: '7',
        icon: 'present',
        name: '借阅管理',
        children: [
            {
                id: '7-1',
                url: "/home/rental-list",
                name: "借阅列表",
                icon: "document",
            }
        ]
    }
];
ADMIN_MENUS =  [
    {
        id: '1',
        icon: 's-home',
        name: '首页',
        url: '/home/dash-board'
    },
    {
        id: '2',
        icon: 'user',
        name: '用户管理',
        children: [
            {
                id: '2-1',
                url: "/home/user-list",
                name: "用户列表",
                icon: "document",
            }
        ]
    },
    {
        id: '3',
        icon: 'suitcase',
        name: '座位管理',
        children: [
            {
                id: '3-1',
                url: "/home/pick-list",
                name: "选座页面",
                icon: "document",
            },
            {
                id: '3-2',
                url: "/home/seat-list",
                name: "座位列表",
                icon: "document",
            },
            {
                id: '3-3',
                url: "/home/schedule-list",
                name: "时刻列表",
                icon: "document",
            }
        ]
    },
    {
        id: '4',
        icon: 'date',
        name: '预约管理',
        children: [
            {
                id: '4-1',
                url: "/home/appointment-list",
                name: "预约列表",
                icon: "document",
            }
        ]
    },
    {
        id: '5',
        icon: 'trophy',
        name: '信誉管理',
        children: [
            {
                id: '5-1',
                url: "/home/credit-list",
                name: "积分列表",
                icon: "document",
            }
        ]
    },
    {
        id: '6',
        icon: 'notebook-1',
        name: '图书管理',
        children: [
            {
                id: '6-1',
                url: "/home/book-list",
                name: "图书列表",
                icon: "document",
            }
        ]
    },
    {
        id: '7',
        icon: 'present',
        name: '借阅管理',
        children: [
            {
                id: '7-1',
                url: "/home/rental-list",
                name: "借阅列表",
                icon: "document",
            }
        ]
    }
];
