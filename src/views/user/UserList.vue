<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索筛选 -->
        <el-form :inline="true" :model="searchParams" class="user-search">
            <el-form-item label="搜索：">
                <el-input size="small" v-model="searchParams.username" placeholder="输入用户昵称"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-select v-model="searchParams.roleId" size="small" placeholder="请选择用户角色">
                    <el-option label="全部" :value="0"></el-option>
                    <el-option label="学生" :value="1"></el-option>
                    <el-option label="管理员" :value="2"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" icon="el-icon-search" @click="search">搜索</el-button>
                <el-button size="small" v-if="loginUser.roleId === 2" type="primary" icon="el-icon-plus" @click="openAdd()">添加</el-button>
            </el-form-item>
        </el-form>
        <!--列表-->
        <el-table size="small" :data="tableData" highlight-current-row v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column align="center" prop="id" label="用户编号" width="100"></el-table-column>
            <el-table-column align="center" prop="username" label="用户昵称" width="120"></el-table-column>
            <el-table-column align="center" label="用户头像" width="100">
                <template slot-scope="scope">
                    <el-image
                            style="width: 75px; height: 60px"
                            :src="scope.row.headPic|filterPhoto"
                            :preview-src-list="scope.row.headPic|filterPhotoList">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="phone" label="手机号码" width="150"></el-table-column>
            <el-table-column align="center" prop="realName" label="真实姓名" width="120"></el-table-column>
            <el-table-column v-if="loginUser.roleId === 2" align="center" label="所属角色" width="100">
                <template slot-scope="scope">
                    <div>{{scope.row.roleId|filterRole}}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="用户性别" width="100">
                <template slot-scope="scope">
                    <div>{{scope.row.sex|filterSex}}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="信誉积分" width="100">
                <template slot-scope="scope">
                    <span @click="viewCreditItem(scope.row)" style="color: #4AAFED; cursor: pointer; text-decoration:underline">{{scope.row.creditRate}}</span>
                    <el-tooltip class="item" effect="dark" content="点击信誉积分可以查看明细" placement="top">
                        <i style="padding-left: 5px" class="el-icon-warning-outline"></i>
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                    <el-button icon="el-icon-edit" type="warning" size="mini" @click="openEdit(scope.row)">编辑</el-button>
                    <el-button v-if="loginUser.roleId === 2" icon="el-icon-delete" size="mini" type="danger" @click="openRemove(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
        <!-- 添加修改页面 -->
        <el-dialog :title="title" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="用户昵称" label-width="120px">
                    <el-input v-model="form.username" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="真实姓名" label-width="120px">
                    <el-input v-model="form.realName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="用户密码" label-width="120px">
                    <el-input v-model="form.password" autocomplete="off" type="password"></el-input>
                </el-form-item>
                <el-form-item label="用户头像" label-width="120px">
                    <input type="file" id="photo-file" style="display:none;" @change="upload">
                    <img :src="form.headPic|filterPhoto" id="photo-view" style="width:100px; height:70px;" />
                    <el-button type="danger" @click="uploadPhoto" style="vertical-align:middle;float:none;margin-top:-50px;margin-left:20px;"><i class="el-icon-upload"></i>上传图片</el-button>
                </el-form-item>
                <el-form-item label="用户手机号" label-width="120px">
                    <el-input v-model="form.phone" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="用户性别" label-width="120px">
                    <el-select v-model="form.sex" placeholder="请选择用户性别">
                        <el-option label="男" :value="1"></el-option>
                        <el-option label="女" :value="2"></el-option>
                        <el-option label="未知" :value="3"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="loginUser.roleId === 2" label="用户角色" label-width="120px">
                    <el-select v-model="form.roleId" placeholder="请选择用户角色">
                        <el-option label="学生" :value="1"></el-option>
                        <el-option label="管理员" :value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="loginUser.roleId === 2" label="信誉积分" label-width="120px">
                    <el-input-number v-model="form.creditRate" :min="0" :max="100"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveUser">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 信誉积分明细页面 -->
        <el-dialog title="信誉积分变化明细" :visible.sync="dialogCreditItemVisible" :close-on-click-modal="false">
            <div>
                <el-timeline :reverse="false">
                    <el-timeline-item
                            v-for="(item, index) in creditItemList"
                            :key="index"
                            :color="item.rate >= 0 ? 'red' : 'green'"
                            :timestamp="item.createTime">
                        <div>积分变化：{{item.rate >= 0 ? '+' + item.rate : item.rate}}分</div>
                        <div>当前积分：{{item.nowRate}}分</div>
                        <div>状态：
                            <span v-if="item.state === 1">执行结束</span>
                            <span v-if="item.state === 2">已撤销</span>
                        </div>
                        <div>描述：{{item.description}}</div>
                    </el-timeline-item>
                </el-timeline>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogCreditItemVisible = false">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Pagination from '../../components/Pagination'
    export default {
        name: 'UserList',
        data() {
            return {
                searchParams: {
                    username: '',
                    roleId: 0,
                    id: ''
                },
                dialogCreditItemVisible: false,
                dialogFormVisible: false,
                form: {
                    id: "",
                    username: "",
                    password: "",
                    realName: "",
                    sex: 3,
                    phone: "",
                    roleId: 1,
                    creditRate: 100,
                    headPic: "common/no_image.jpg"
                },
                creditItemList: [],
                pageParams: {
                    currentPage: 1,
                    pageSize: 5,
                    total: 0
                },
                title: '',
                tableData: [],
                loading: true, //是显示加载
                loginUser: {}
            }
        },
        // 注册组件
        components: {
            Pagination
        },
        created() {
            this.getLoginUser();
        },
        filters: {
            filterRole(val) {
                if(val === 1) {
                    return '学生';
                } else if(val === 2) {
                    return '管理员';
                }
            },
            filterPhoto(img){
                return process.env.VUE_APP_URL + "/photo/view?filename=" + img;
            },
            filterPhotoList(img) {
                return [process.env.VUE_APP_URL + "/photo/view?filename=" + img];
            },
            filterSex(sex) {
                if(sex === 1) {
                    return "男";
                } else if (sex === 2) {
                    return "女";
                } else {
                    return "未知";
                }
            }
        },
        methods: {
            getLoginUser() {
                this.$ajax.post("/user/getLoginUser", {token: Tool.getLoginUser()}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        if(resp.data) {
                            this.loginUser = resp.data;
                            this.searchParams.id = this.loginUser.id;
                            this.getUserList();
                        } else {
                            this.$message.error(resp.msg);
                            this.$router.push("/login");
                        }
                    }
                });
            },
            viewCreditItem(item) {
                let data = {
                    searchEntity: {
                        userId: item.id
                    },
                    paging: 0
                };
                this.$ajax.post("/user/viewCreditItem", data).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.creditItemList = resp.data.list;
                        this.dialogCreditItemVisible = true;
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            openAdd(){
                this.form.id = "";
                this.dialogFormVisible = true;
                this.title = "添加用户信息";
            },
            openEdit(item){
                this.form = {...item};
                this.title = "修改用户信息";
                this.dialogFormVisible = true;
            },
            saveUser(){
                this.$ajax.post("/user/save", this.form).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.dialogFormVisible = false;
                        this.$message.success(resp.msg);
                        this.getUserList();
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            getUserList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize
                };
                this.loading = true;
                this.$ajax.post("/user/list", data).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.tableData = resp.data.list;
                        this.pageParams.total = resp.data.total;
                        this.loading = false;
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            openRemove(item){
                this.$confirm('确定要删除编号为：' + item.id + ' 的记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.removeUser(item);
                });
            },
            removeUser(item){
                this.$ajax.post("/user/remove", item).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.$message.success(resp.msg);
                        this.getUserList();
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            changePagination(params) {
                this.pageParams.currentPage = params.currentPage;
                this.pageParams.pageSize = params.pageSize;
                this.getUserList();
            },
            // 搜索事件
            search() {
                this.pageParams.currentPage = 1;
                this.pageParams.pageSize = 5;
                this.getUserList();
            },
            uploadPhoto(){
                $("#photo-file").click();
            },
            upload(){
                if($("#photo-file").val() === '')return;
                let config = {
                    headers:{'Content-Type':'multipart/form-data'}
                };
                let formData = new FormData();
                formData.append('photo',document.getElementById('photo-file').files[0]);
                // 普通上传
                this.$ajax.post("/photo/upload_photo", formData, config).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        $("#photo-view").attr('src', process.env.VUE_APP_URL + '/photo/view?filename=' + resp.data);
                        this.form.headPic = resp.data;
                        this.$message.success(resp.msg);
                    }else{
                        this.$message.error(resp.msg);
                    }
                    $("#photo-file").val("");
                });
            }
        }
    }
</script>

<style scoped>
    .user-search {
        margin-top: 20px;
    }
    /deep/ .el-dialog {
        max-height: 100vh;
        overflow: auto;
    }
    .userRole {
        width: 100%;
    }
</style>


