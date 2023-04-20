<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>图书列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索筛选 -->
        <el-form :inline="true" :model="searchParams" class="user-search">
            <el-form-item label="搜索：">
                <el-input size="small" v-model="searchParams.name" placeholder="输入图书名称"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-select v-model="searchParams.state" size="small" placeholder="请选择图书状态">
                    <el-option label="全部" :value="0"></el-option>
                    <el-option label="待借阅" :value="1"></el-option>
                    <el-option label="已借阅" :value="2"></el-option>
                    <el-option label="已下架" :value="3"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" @click="searchBook" icon="el-icon-search">搜索</el-button>
                <el-button size="small" v-if="loginUser.roleId === 2" type="primary" icon="el-icon-plus" @click="openAdd()">添加</el-button>
            </el-form-item>
        </el-form>
        <el-table size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column width="100" align="center" prop="id" label="编号"></el-table-column>
            <el-table-column width="150" align="center" prop="name" label="图书名称"></el-table-column>
            <el-table-column align="center" label="封面图片" width="100">
                <template slot-scope="scope">
                    <el-image
                            style="width: 75px; height: 60px"
                            :src="scope.row.photo|filterPhoto"
                            :preview-src-list="scope.row.photo|filterPhotoList">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column width="300" align="center" prop="info" label="图书简介"></el-table-column>
            <el-table-column align="center" prop="author" label="图书作者"></el-table-column>
            <el-table-column width="150" align="center" prop="createTime" label="发布时间"></el-table-column>
            <el-table-column align="center" label="状态">
                <template slot-scope="scope">
                    <div style="color: green" v-if="scope.row.state === 1">待借阅</div>
                    <div style="color: red" v-if="scope.row.state === 2">已借阅</div>
                    <div style="color: grey" v-if="scope.row.state === 3">已下架</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="225">
                <template slot-scope="scope">
                    <el-button icon="el-icon-present" v-if="loginUser.roleId === 1 && scope.row.state === 1" size="mini" type="success" @click="openRental(scope.row)">借阅</el-button>
                    <el-button icon="el-icon-edit" v-if="loginUser.roleId === 2" size="mini" type="warning" @click="openEdit(scope.row)">编辑</el-button>
                    <el-button icon="el-icon-delete" v-if="loginUser.roleId === 2" size="mini" type="danger" @click="removeBook(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
        <!-- 添加修改页面 -->
        <el-dialog :title="title" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="图书名称" label-width="120px">
                    <el-input v-model="form.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="图书简介" label-width="120px">
                    <el-input v-model="form.info" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="图书作者" label-width="120px">
                    <el-input v-model="form.author" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="封面图片" label-width="120px">
                    <input type="file" id="photo-file" style="display:none;" @change="upload">
                    <img :src="form.photo|filterPhoto" id="photo-view" style="width:100px; height:70px;" />
                    <el-button type="danger" @click="uploadPhoto" style="vertical-align:middle;float:none;margin-top:-50px;margin-left:20px;"><i class="el-icon-upload"></i>上传图片</el-button>
                </el-form-item>
                <el-form-item label="图书状态" label-width="120px">
                    <el-select v-model="form.state" placeholder="请选择图书状态">
                        <el-option label="待借阅" :value="1"></el-option>
                        <el-option label="已借阅" :value="2"></el-option>
                        <el-option label="已下架" :value="3"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveBook">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 借阅页面 -->
        <el-dialog title="借阅图书" :visible.sync="rentalDialogFormVisible" :close-on-click-modal="false">
            <el-form :model="rentalForm">
                <el-form-item label="图书编号：" label-width="120px">
                    <div>{{rentalForm.id}}</div>
                </el-form-item>
                <el-form-item label="图书名称：" label-width="120px">
                   <div>{{rentalForm.name}}</div>
                </el-form-item>
                <el-form-item label="封面图片：" label-width="120px">
                    <img :src="rentalForm.photo|filterPhoto" style="width:100px; height:70px;" />
                </el-form-item>
                <el-form-item label="预计归还时间：" label-width="120px">
                    <el-date-picker
                            value-format="yyyy-MM-dd"
                            format="yyyy-MM-dd"
                            size="small"
                            v-model="rentalForm.predictTime"
                            type="date"
                            :picker-options="pickerOptions"
                            :clearable="false"
                            :editable="false">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="rentalDialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="rentalBook">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Pagination from '../../components/Pagination'
    export default {
        name: 'AppointmentList',
        data() {
            return {
                pickerOptions: {
                    disabledDate: (time) => {
                        return time.getTime() < Date.now() - 8.64e7
                    }
                },
                searchParams: {
                    name: '',
                    state: 0
                },
                form: {
                    id: '',
                    name: '',
                    author: '',
                    info: '',
                    state: 1,
                    photo: "common/no_image.jpg"
                },
                rentalForm: {
                    id: '',
                    name: '',
                    photo: "common/no_image.jpg",
                    predictTime: '',
                    userId: '',
                    bookId: ''
                },
                loading: true,
                tableData: [],
                scheduleList: [],
                pageParams: {
                    currentPage: 1,
                    pageSize: 5,
                    total: 0
                },
                dialogFormVisible: false,
                rentalDialogFormVisible: false,
                title: '',
                loginUser: {}
            }
        },
        created() {
            // 获取当前登录用户
            this.getLoginUser();
            // 获取图书数据
            this.getBookList();
        },
        // 注册组件
        components: {
            Pagination
        },
        filters: {
            filterPhoto(img){
                return process.env.VUE_APP_URL + "/photo/view?filename=" + img;
            },
            filterPhotoList(img) {
                return [process.env.VUE_APP_URL + "/photo/view?filename=" + img];
            }
        },
        methods: {
            openRental(item) {
                this.rentalForm = {...item};
                this.rentalForm.bookId = item.id;
                this.rentalForm.userId = this.loginUser.id;
                this.rentalDialogFormVisible = true;
            },
            rentalBook() {
                this.$confirm('确定要借阅编号为：' + this.rentalForm.id + ' 的图书吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/book/rental", this.rentalForm).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.rentalDialogFormVisible = false;
                            this.getBookList();
                        } else {
                            this.$message.error(resp.msg);
                        }
                    });
                });
            },
            changePagination(params) {
                this.pageParams.currentPage = params.currentPage;
                this.pageParams.pageSize = params.pageSize;
                this.getBookList();
            },
            removeBook(item) {
                this.$confirm('确定要删除编号为：' + item.id + ' 的记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/book/remove", {id: item.id}).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.getBookList();
                        } else {
                            this.$message.error(resp.msg);
                        }
                    });
                });
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
                        this.form.photo = resp.data;
                        this.$message.success(resp.msg);
                    }else{
                        this.$message.error(resp.msg);
                    }
                    $("#photo-file").val("");
                });
            },
            openAdd(){
                this.form.id = "";
                this.dialogFormVisible = true;
                this.title = "添加图书信息";
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
            },
            searchBook() {
                this.pageParams.currentPage = 1;
                this.pageParams.pageSize = 5;
                this.getBookList();
            },
            saveBook() {
                this.$ajax.post("/book/save", this.form).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.dialogFormVisible = false;
                        this.$message.success(resp.msg);
                        this.getBookList();
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            openEdit(item){
                this.form = {...item};
                this.title = "修改图书详情信息";
                this.dialogFormVisible = true;
            },
            getBookList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize
                };
                this.loading = true;
                this.$ajax.post("/book/list", data).then((response)=>{
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
        }
    }
</script>

<style scoped>
    .user-search {
        margin-top: 20px;
    }
</style>


