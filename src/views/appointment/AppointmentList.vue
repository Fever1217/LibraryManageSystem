<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>预约列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索筛选 -->
        <el-form :inline="true" :model="searchParams" class="user-search">
            <el-form-item label="搜索：">
                <el-date-picker
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        size="small"
                        :editable="false"
                        v-model="searchParams.openTime"
                        type="date"
                        placeholder="选择开放时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" @click="searchSeatItem" icon="el-icon-search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-table size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column align="center" prop="id" label="编号"></el-table-column>
            <el-table-column align="center" prop="row" label="座位行数"></el-table-column>
            <el-table-column align="center" prop="col" label="座位列数"></el-table-column>
            <el-table-column align="center" prop="createTime" label="选座时间"></el-table-column>
            <el-table-column align="center" prop="openTime" label="开放时间"></el-table-column>
            <el-table-column align="center" prop="rangeTime" label="所属时刻"></el-table-column>
            <el-table-column align="center" label="状态">
                <template slot-scope="scope">
                    <div v-if="scope.row.state === 1">已预约</div>
                    <div v-if="scope.row.state === 2">使用中</div>
                    <div v-if="scope.row.state === 3">已违约</div>
                    <div v-if="scope.row.state === 4">已取消</div>
                    <div v-if="scope.row.state === 5">已完成</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="225">
                <template slot-scope="scope">
                    <el-button size="small" type="success" v-if="scope.row.state === 1 && loginUser.roleId === 1" icon="el-icon-circle-check" @click="checkSeat(scope.row)">签到</el-button>
                    <el-button size="small" type="success" v-if="scope.row.state === 2 && loginUser.roleId === 1" icon="el-icon-circle-close" @click="outSeat(scope.row)">签退</el-button>
                    <el-button icon="el-icon-circle-close" v-if="scope.row.state === 1 && loginUser.roleId === 1" size="mini" type="info" @click="cancel(scope.row)">取消</el-button>
                    <el-button icon="el-icon-edit"  v-if="loginUser.roleId === 2 && scope.row.state !== 4" size="mini" type="warning" @click="openEdit(scope.row)">编辑</el-button>
                    <el-button icon="el-icon-delete" v-if="loginUser.roleId === 2" size="mini" type="danger" @click="remove(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
        <!-- 添加修改页面 -->
        <el-dialog :title="title" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="开放时间：" label-width="120px">
                    <div>{{form.openTime}}</div>
                </el-form-item>
                <el-form-item label="所属时刻：" label-width="120px">
                    <div>{{form.rangeTime}}</div>
                </el-form-item>
                <el-form-item label="座位行数：" label-width="120px">
                    <div>第{{form.row}}行</div>
                </el-form-item>
                <el-form-item label="座位列数：" label-width="120px">
                    <div>第{{form.col}}列</div>
                </el-form-item>
                <el-form-item label="状态：" label-width="120px">
                    <el-select v-model="form.state" placeholder="请选择状态">
                        <el-option label="已预约" :value="1"></el-option>
                        <el-option label="使用中" :value="2"></el-option>
                        <el-option label="已违约" :value="3"></el-option>
                        <el-option label="已完成" :value="5"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="save">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Pagination from "../../components/Pagination";
    export default {
        name: 'AppointmentList',
        data() {
            return {
                searchParams: {
                    openTime: '',
                    userId: ''
                },
                form: {
                    id: '',
                    row: 1,
                    col: 1,
                    rangeTime: '',
                    openTime: new Date(),
                    state: 1
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
                title: '',
                loginUser: {}
            }
        },
        created() {
            // 获取当前登录用户
            this.getLoginUser();
            // 获取所有时刻数据
            this.getAllScheduleList();
        },
        // 注册组件
        components: {
            Pagination
        },
        methods: {
            changePagination(params) {
                this.pageParams.currentPage = params.currentPage;
                this.pageParams.pageSize = params.pageSize;
                this.getSeatItemList();
            },
            remove(item) {
                this.$confirm('确定要删除编号为：' + item.id + ' 的记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/seat/removeSeatItem", {id: item.id}).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.getSeatItemList();
                        } else {
                            this.$message.error(resp.msg);
                        }
                    });
                });
            },
            cancel(item) {
                let rangeTime = item.seatDTO.scheduleDTO.rangeTime.split('-');
                let time = item.seatDTO.openTime + ' ' + rangeTime[0] + ':00';
                if((new Date(time)).getTime() <= (new Date()).getTime()) {
                    this.$message.warning("座位所属时间小于当前时间，不能取消！");
                    return false;
                }
                this.$confirm('确认要取消此预订吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/seat/updateSeatItemState", {id: item.id, state: 4}).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success("取消成功！");
                            this.getSeatItemList();
                        } else {
                            this.$message.error(resp.msg);
                        }
                    });
                });
            },
            checkSeat(item) {
                let rangeTime = item.seatDTO.scheduleDTO.rangeTime.split('-');
                let startTime = item.seatDTO.openTime + ' ' + rangeTime[0] + ':00';
                let endTime = item.seatDTO.openTime + ' ' + rangeTime[1] + ':00';
                if((new Date(startTime)).getTime() > (new Date()).getTime() ||
                    (new Date(endTime)).getTime() < (new Date()).getTime()) {
                    this.$message.warning("当前时间不属于座位所属时间，签到失败！");
                    return false;
                }
                this.$ajax.post("/seat/updateSeatItemState", {id: item.id, state: 2}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.$message.success("签到成功！");
                        this.getSeatItemList();
                    } else {
                        this.$message.error(resp.msg);
                    }
                });
            },
            outSeat(item) {
                this.$ajax.post("/seat/updateSeatItemState", {id: item.id, state: 5}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.$message.success("签退成功！");
                        this.getSeatItemList();
                    } else {
                        this.$message.error(resp.msg);
                    }
                });
            },
            getLoginUser() {
                this.$ajax.post("/user/getLoginUser", {token: Tool.getLoginUser()}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        if(resp.data) {
                            this.loginUser = resp.data;
                            this.searchParams.userId = this.loginUser.id;
                            // 获取座位详情数据
                            this.getSeatItemList();
                        } else {
                            this.$message.error(resp.msg);
                            this.$router.push("/login");
                        }
                    }
                });
            },
            searchSeatItem() {
                this.pageParams.currentPage = 1;
                this.pageParams.pageSize = 5;
                this.getSeatItemList();
            },
            save() {
                this.$ajax.post("/seat/updateSeatItemState", this.form).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.$message.success("修改状态成功！");
                        this.dialogFormVisible = false;
                        this.getSeatItemList();
                    } else {
                        this.$message.error(resp.msg);
                    }
                });
            },
            openEdit(item){
                this.form = {...item};
                this.title = "修改座位详情信息";
                this.dialogFormVisible = true;
            },
            getSeatItemList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize
                };
                this.loading = true;
                this.$ajax.post("/seat/getSeatItemList", data).then((response)=>{
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
            getAllScheduleList() {
                this.$ajax.post("/schedule/all").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.scheduleList = resp.data;
                        this.form.scheduleId = this.scheduleList[0] ? this.scheduleList[0].id : '';
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


