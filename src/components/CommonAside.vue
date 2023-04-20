<template>
    <el-menu :collapse="collapsed"
             collapse-transition
             :default-openeds=openedRouter
             :default-active="activeRouter"
             class="el-menu-vertical-demo"
             background-color="#334157"
             text-color="#fff"
             active-text-color="#ffd04b">
        <div class="logo-box">
            <img class="logo-img" src="../assets/img/logo.png" alt="">
        </div>
        <el-menu-item :index="item.url|subPath" @click="clickMenu(item)" v-for="item in noChildren" :id="item.url|subPath" :key="item.name">
            <i :class="'el-icon-'+item.icon"></i>
            <span slot="title" v-text="item.name"></span>
        </el-menu-item>
        <el-submenu v-for="item in hasChildren" :key="item.id" :index="item.name">
            <template slot="title">
                <i :class="'el-icon-'+item.icon"></i>
                <span>{{item.name}}</span>
            </template>
            <el-menu-item-group>
                <el-menu-item v-for="child in item.children" @click="clickMenu(child)" :id="child.url|subPath" :index="child.url|subPath" :key="child.id">
                    <i :class="'el-icon-'+child.icon"></i>
                    <span>{{child.name}}</span>
                </el-menu-item>
            </el-menu-item-group>
        </el-submenu>
    </el-menu>
</template>
<script>
    export default {
        name: 'CommonAside',
        data() {
            return {
                collapsed: false,
                menus: [],
                activeRouter: '',
                openedRouter: [],
                loginUser: {}
            }
        },
        computed:{
            noChildren(){
                return this.menus.filter((item) => !item.children);
            },
            hasChildren(){
                return this.menus.filter((item) => item.children);
            }
        },
        filters:{
            subPath(url){
                if(typeof(url) === "undefined" || url === null){
                    return "";
                }
                return url.substr(url.lastIndexOf('/') + 1, url.length - 1);
            }
        },
         created() {
            this.getLoginUser();

            this.$root.Bus.$on('toggle', value => {
                this.collapsed = !value
            })
        },
        methods: {
            initMenus() {
                let data = [];
                if(this.loginUser.roleId === 1) {
                    data = STUDENT_MENUS;
                } else if (this.loginUser.roleId === 2) {
                    data = ADMIN_MENUS;
                }
                this.menus = data;

                let url = "";
                url = this.$route.path.substr(this.$route.path.lastIndexOf('/') + 1,this.$route.path.length-1);
                $("#"+ url).click();
                this.activeRouter = url;
                this.openedRouter = [url];
            },
            getLoginUser() {
                this.$ajax.post("/user/getLoginUser", {token: Tool.getLoginUser()}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        if(resp.data) {
                            this.loginUser = resp.data;
                            this.initMenus();
                        } else {
                            this.$message.error(resp.msg);
                            this.$router.push("/login");
                        }
                    }
                });
            },
            clickMenu(item) {
                this.$router.push(item.url);
            }
        }
    }
</script>
<style>
    .el-menu-vertical-demo:not(.el-menu--collapse) {
        width: 240px;
        min-height: 400px;
    }
    .el-menu-vertical-demo:not(.el-menu--collapse) {
        border: none;
        text-align: left;
    }
    .el-menu-item-group__title {
        padding: 0;
    }
    .el-menu-bg {
        background-color: #1f2d3d !important;
    }
    .el-menu {
        border: none;
    }
    .logo-box {
        height: 40px;
        line-height: 40px;
        color: #9d9d9d;
        font-size: 20px;
        text-align: center;
        padding: 20px 0;
    }
    .logo-img {
        height: 40px;
    }
</style>
