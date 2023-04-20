<template>
    <el-container class="index-con">
        <el-aside :class="collapsed ? 'aside' : 'aside-show'">
            <CommonAside></CommonAside>
        </el-aside>
        <el-container class="main-con">
            <el-header class="index-header">
                <CommonHeader></CommonHeader>
            </el-header>
            <el-main clss="index-main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
    // 导入组件
    import CommonHeader from '../components/CommonHeader.vue'
    import CommonAside from '../components/CommonAside.vue'
    export default {
        name: 'Home',
        data() {
            return {
                collapsed: false
            }
        },
        // 注册组件
        components: {
            CommonHeader,
            CommonAside
        },
        created() {
            this.$root.Bus.$on('toggle', value => {
                this.collapsed = !value
            })
        },
        methods: {}
    }
</script>
<style >
    .index-con {
        height: 100%;
        width: 100%;
        box-sizing: border-box;
    }

    .aside {
        width: 64px !important;
        height: 100%;
        background-color: #334157;
        margin: 0;
    }
    .aside-show {
        width: 240px !important;
        height: 100%;
        background-color: #334157;
        margin: 0;
    }
    .index-header,
    .index-main {
        padding: 0;
        border-left: 2px solid #333;
    }
</style>
