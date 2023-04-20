<template>
    <el-menu class="el-menu-demo" mode="horizontal" background-color="#334157" text-color="#fff" active-text-color="#fff">
        <el-button class="button-img">
            <img class="show-img" :src="collapsed ? imgClose : imgShow" @click="toggle(collapsed)">
        </el-button>
        <el-submenu index="2" class="submenu">
            <template slot="title">
                <span class="el-dropdown-link">
                    <img :src="loginUser.headPic|filterPhoto" class="user" />
                </span>
                <span style="padding-left: 10px">{{loginUser.username}}</span>
            </template>
            <el-menu-item index="2-1" @click="logout">退出登录</el-menu-item>
        </el-submenu>
    </el-menu>
</template>
<script>
    export default {
        name: 'CommonHeader',
        data() {
            return {
                collapsed: true,
                imgShow: require('../assets/img/show.png'),
                imgClose: require('../assets/img/sq.png'),
                loginUser: {}
            }
        },
        // 创建完毕状态(里面是操作)
        created() {
            this.getLoginUser();
        },
        filters: {
            filterPhoto(img) {
                return process.env.VUE_APP_URL + "/photo/view?filename=" + img;
            }
        },
        methods: {
            // 切换显示
            toggle(showType) {
                this.collapsed = !showType;
                this.$root.Bus.$emit('toggle', this.collapsed)
            },
            logout() {
                this.$ajax.post("/user/logout", {token: Tool.getLoginUser()}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        SessionStorage.remove(SESSION_KEY_LOGIN_USER);
                        this.$message.success(resp.msg);
                        this.$router.push("/login");
                    }
                });
            },
            getLoginUser() {
                this.$ajax.post("/user/getLoginUser", {token: Tool.getLoginUser()}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        if(resp.data) {
                            this.loginUser = resp.data;
                        } else {
                            this.$message.error(resp.msg);
                            this.$router.push("/login");
                        }
                    }
                });
            }
        }
    }
</script>
<style scoped>
    .submenu {
        float: right;
    }
    .button-img {
        height: 60px;
        background-color: transparent;
        border: none;
    }
    .show-img {
        width: 26px;
        height: 26px;
        position: absolute;
        top: 17px;
        left: 17px;
    }
    .user {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }
    .show-img:active {
        border: none;
    }
</style>
