<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>座位列表</el-breadcrumb-item>
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
                <el-select v-model="searchParams.scheduleId" :clearable="true" size="small" placeholder="请选择时刻">
                    <el-option v-for="(item, index) in scheduleList" :key="index" :label="item.name + '(' + item.rangeTime + ')'" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" @click="searchSeat" icon="el-icon-search">搜索</el-button>
                <el-button size="small" type="primary" icon="el-icon-plus" @click="openAdd()">添加</el-button>
            </el-form-item>
        </el-form>
        <el-table size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column align="center" prop="id" label="编号"></el-table-column>
            <el-table-column align="center" prop="row" label="座位行数"></el-table-column>
            <el-table-column align="center" prop="col" label="座位列数"></el-table-column>
            <el-table-column align="center" prop="openTime" label="开放时间"></el-table-column>
            <el-table-column align="center" label="所属时刻">
                <template slot-scope="scope">
                    <div>{{scope.row.scheduleDTO.name + '(' + scope.row.scheduleDTO.rangeTime + ')'}}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="totalNum" label="总座位数"></el-table-column>
            <el-table-column align="center" prop="pickNum" label="已选座位数"></el-table-column>
            <el-table-column align="center" label="操作" width="200">
                <template slot-scope="scope">
                    <el-button icon="el-icon-edit" type="warning" size="mini" @click="openEdit(scope.row)">编辑</el-button>
                    <el-button icon="el-icon-delete" size="mini" type="danger" @click="removeSeat(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
        <!-- 添加修改页面 -->
        <el-dialog :title="title" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="开放时间" label-width="120px">
                    <el-date-picker
                            value-format="yyyy-MM-dd"
                            format="yyyy-MM-dd"
                            size="small"
                            :editable="false"
                            :clearable="false"
                            v-model="form.openTime"
                            type="date"
                            placeholder="选择开放时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="所属时刻" label-width="120px">
                    <el-select v-model="form.scheduleId" size="small" placeholder="请选择所属时刻">
                        <el-option v-for="(item, index) in scheduleList" :key="index" :label="item.name + '(' + item.rangeTime + ')'" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="座位行数" label-width="120px">
                    <el-input-number v-model="form.row" :min="1" :max="8"></el-input-number>
                </el-form-item>
                <el-form-item label="座位列数" label-width="120px">
                    <el-input-number v-model="form.col" :min="1" :max="8"></el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveSeat">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Pagination from "../../components/Pagination";
    export default {
        name: 'SeatList',
        data() {
            return {
                searchParams: {
                    openTime: '',
                    scheduleId: ''
                },
                form: {
                    id: '',
                    row: 1,
                    col: 1,
                    scheduleId: '',
                    openTime: ''
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
                editRow: {}
            }
        },
        created() {
            this.form.openTime = this.getNowDay();
            // 获取所有时刻数据
            this.getAllScheduleList();
            // 获取座位数据
            this.getSeatList();
        },
        // 注册组件
        components: {
            Pagination
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
            changePagination(params) {
                this.pageParams.currentPage = params.currentPage;
                this.pageParams.pageSize = params.pageSize;
                this.getSeatList();
            },
            removeSeat(item) {
                this.$confirm('确定要删除编号为：' + item.id + ' 的记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/seat/remove", {id: item.id}).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.getSeatList();
                        } else {
                            this.$message.error(resp.msg);
                        }
                    });
                });
            },
            searchSeat() {
                this.pageParams.currentPage = 1;
                this.pageParams.pageSize = 5;
                this.getSeatList();
            },
            openAdd() {
                this.form.id = "";
                this.dialogFormVisible = true;
                this.title = "添加座位信息";
            },
            saveSeat() {
                if(this.form.id !== '' && (this.form.row !== this.editRow.row || this.form.col !== this.editRow.col)) {
                    this.$confirm('修改行数或列数可能导致部门选座数据丢失，确认继续此操作？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.save();
                    });
                } else {
                    this.save();
                }
            },
            save() {
                this.$ajax.post("/seat/save", this.form).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0) {
                        this.dialogFormVisible = false;
                        this.$message.success(resp.msg);
                        this.getSeatList();
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            openEdit(item){
                this.form = {...item};
                this.editRow = {...item};
                this.title = "修改座位信息";
                this.dialogFormVisible = true;
            },
            getSeatList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize
                };
                this.loading = true;
                this.$ajax.post("/seat/list", data).then((response)=>{
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


