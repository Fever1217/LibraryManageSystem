<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>借阅列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索筛选 -->
        <el-form :inline="true" :model="searchParams" class="user-search">
            <el-form-item label="搜索：">
                <el-input size="small" v-model="searchParams.bookName" placeholder="输入图书名称"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-input size="small" v-model="searchParams.userDTO.username" placeholder="输入用户昵称"></el-input>
            </el-form-item>
            <el-form-item label="">
                <el-select v-model="searchParams.state" size="small" placeholder="请选择借阅状态">
                    <el-option label="全部" :value="0"></el-option>
                    <el-option label="借阅中" :value="1"></el-option>
                    <el-option label="正常归还" :value="2"></el-option>
                    <el-option label="异常归还" :value="3"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" @click="searchRental" icon="el-icon-search">搜索</el-button>
            </el-form-item>
            <el-form-item label="">
                <el-tooltip class="item" effect="dark" content="如需归还图书，请线下去归还图书，归还后管理员会修改借阅信息！" placement="top">
                    <i style="padding-left: 15px" class="el-icon-warning-outline"></i>
                </el-tooltip>
            </el-form-item>
        </el-form>
        <el-table size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column width="100" align="center" prop="id" label="编号"></el-table-column>
            <el-table-column width="150" align="center" prop="bookName" label="借阅图书名称"></el-table-column>
            <el-table-column align="center" label="借阅图书图片" width="100">
                <template slot-scope="scope">
                    <el-image
                            style="width: 75px; height: 60px"
                            :src="scope.row.bookPhoto|filterPhoto"
                            :preview-src-list="scope.row.bookPhoto|filterPhotoList">
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column align="center" label="借阅用户" width="100">
                <template slot-scope="scope">
                    <div>{{scope.row.userDTO.username}}</div>
                </template>
            </el-table-column>
            <el-table-column width="150" align="center" prop="createTime" label="借阅时间"></el-table-column>
            <el-table-column width="100" align="center" prop="predictTime" label="预计归还时间"></el-table-column>
            <el-table-column width="100" align="center" prop="returnTime" label="实际归还时间"></el-table-column>
            <el-table-column width="70" align="center" label="借阅状态">
                <template slot-scope="scope">
                    <div v-if="scope.row.state === 1">借阅中</div>
                    <div style="color: green" v-if="scope.row.state === 2">正常归还</div>
                    <div style="color: red" v-if="scope.row.state === 3">异常归还</div>
                </template>
            </el-table-column>
            <el-table-column width="70" align="center" label="缴费金额">
                <template slot-scope="scope">
                    <div>{{scope.row.money}}元</div>
                </template>
            </el-table-column>
            <el-table-column align="center" width="200" prop="note" label="备注"></el-table-column>
            <el-table-column v-if="loginUser.roleId === 2" fixed="right" align="center" label="操作" width="225">
                <template slot-scope="scope">
                    <el-button icon="el-icon-upload2" v-if="scope.row.state === 1" size="mini" type="success" @click="openReturn(scope.row)">归还</el-button>
                    <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeRental(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
        <!-- 归还页面 -->
        <el-dialog title="归还图书" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="借阅编号：" label-width="120px">
                    <div>{{form.id}}</div>
                </el-form-item>
                <el-form-item label="赔偿金额：" label-width="120px">
                    <el-input-number v-model="form.money" :precision="2" :step="0.1" :min="0"></el-input-number>
                </el-form-item>
                <el-form-item label="借阅状态：" label-width="120px">
                    <el-select v-model="form.state" size="small" placeholder="请选择借阅状态">
                        <el-option label="正常归还" :value="2"></el-option>
                        <el-option label="异常归还" :value="3"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="实际归还时间：" label-width="120px">
                    <el-date-picker
                            value-format="yyyy-MM-dd"
                            format="yyyy-MM-dd"
                            size="small"
                            v-model="form.returnTime"
                            type="date"
                            :picker-options="pickerOptions"
                            :clearable="false"
                            :editable="false">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注：" label-width="120px">
                    <el-input size="small" v-model="form.note" placeholder="请输入备注"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="returnBook">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Pagination from '../../components/Pagination'
    export default {
        name: 'RentalList',
        data() {
            return {
                pickerOptions: {
                    disabledDate: (time) => {
                        return time.getTime() < Date.now() - 8.64e7
                    }
                },
                searchParams: {
                    userDTO: {
                        username: '',
                        id: ''
                    },
                    bookName: '',
                    state: 0
                },
                form: {
                    id: '',
                    returnTime: '',
                    money: 0,
                    state: 2,
                    note: ''
                },
                loading: true,
                tableData: [],
                pageParams: {
                    currentPage: 1,
                    pageSize: 5,
                    total: 0
                },
                dialogFormVisible: false,
                loginUser: {}
            }
        },
        created() {
            // 获取当前登录用户
            this.getLoginUser();
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
            getNowDay() {
                let date = new Date();
                let y = date.getFullYear();
                let m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                let d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                return  y + '-' + m + '-' + d;
            },
            openReturn(item) {
                this.form = {...item};
                this.form.state = 2;
                this.form.returnTime = this.getNowDay();
                this.dialogFormVisible = true;
            },
            returnBook() {
                this.$confirm('归还图书后，此记录不能再修改，是否确定归还图书?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/book/return", this.form).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.dialogFormVisible = false;
                            this.getRentalList();
                        } else {
                            this.$message.error(resp.msg);
                        }
                    });
                });
            },
            removeRental(item) {
                if(item.state === 1) {
                    this.$message.warning("当前仍处于借阅状态，无法删除！");
                    return false;
                }
                this.$confirm('确定要删除编号为：' + item.id + ' 的记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/book/removeRental", {id: item.id}).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.getRentalList();
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
            getLoginUser() {
                this.$ajax.post("/user/getLoginUser", {token: Tool.getLoginUser()}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        if(resp.data) {
                            this.loginUser = resp.data;
                            this.searchParams.userDTO.id = this.loginUser.id;
                            // 获取租赁数据
                            this.getRentalList();
                        } else {
                            this.$message.error(resp.msg);
                            this.$router.push("/login");
                        }
                    }
                });
            },
            searchRental() {
                this.pageParams.currentPage = 1;
                this.pageParams.pageSize = 5;
                this.getRentalList();
            },
            getRentalList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize
                };
                this.loading = true;
                this.$ajax.post("/book/rentalList", data).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.tableData = resp.data.list;
                        this.pageParams.total = resp.data.total;
                        this.loading = false;
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .user-search {
        margin-top: 20px;
    }
</style>


