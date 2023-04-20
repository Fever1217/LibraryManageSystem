<template>
    <div class="login-wrap">
        <el-form label-position="left" :model="form" label-width="0px" class="demo-ruleForm login-container">
            <h3 class="title">用户登录</h3>
            <el-form-item prop="username">
                <el-input type="text" v-model="form.username" auto-complete="off" placeholder="用户昵称"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input type="password" v-model="form.password" auto-complete="off" placeholder="用户密码"></el-input>
            </el-form-item>
            <el-form-item prop="captcha" style="margin-bottom: 0">
                <div style="display: flex; flex-direction: row">
                    <el-input type="text" style="width: 65%" v-model="form.captcha" auto-complete="off" placeholder="验证码"></el-input>
                    <TheCaptcha style="width: 30%; text-align: right" @generatorCode="generatorCode" :identify-code="form.correctCaptcha" />
                </div>
            </el-form-item>
            <router-link to="/register"><h6 class="to-register">还没账号？立即注册</h6></router-link>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click="submitLogin" :loading="loading">登录</el-button>
            </el-form-item>

            <h6 class="copy-right"></h6>
        </el-form>
    </div>
</template>
<script type="text/javascript">
    import TheCaptcha from "../components/TheCaptcha.vue";
    export default {
        name: 'Login',
        data() {
            return {
                loading: false,
                form: {
                    username: '',
                    password: '',
                    correctCaptcha: '',
                    captcha: ''
                }
            }
        },
        // 注册组件
        components: {
            TheCaptcha
        },
        // 创建完毕状态(里面是操作)
        created() {
            // 获取图形验证码
            this.generatorCode();
        },
        // 里面的函数只有调用才会执行
        methods: {
            generatorCode(){
                this.$ajax.post("/captcha/generate_captcha").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.form.correctCaptcha = resp.data;
                    }
                });
            },
            submitLogin() {
                this.loading = true;
                this.$ajax.post("/user/login", this.form).then((response)=>{
                    let resp = response.data;
                    this.loading = false;
                    if(resp.code === 0){
                        Tool.setLoginUser(resp.data.token);
                        this.$message.success(resp.msg);
                        this.$router.push("/home/dash-board");
                    }else{
                        this.generatorCode();
                        this.$message.error(resp.msg);
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        padding-top: 10%;
        background-image: url('../assets/img/background.svg');
        background-repeat: no-repeat;
        background-position: center right;
        background-size: 100%;
    }
    .login-container {
        border-radius: 10px;
        margin: 0 auto;
        width: 350px;
        padding: 30px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        text-align: left;
        box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
    }
    .title {
        margin: 0 auto 40px auto;
        text-align: center;
        color: #505458;
    }
    .copy-right {
        text-align: center;
        margin: 0 auto 0 auto;
    }
    .to-register {
        margin: 0 0 10px 0;
        text-align: right;
        color: dodgerblue;
    }
    a {
        text-decoration: none;
    }
</style>
