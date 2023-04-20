<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>时刻列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-table size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%; margin-top: 10px">
            <el-table-column prop="id" align="center" label="时刻编号"></el-table-column>
            <el-table-column prop="name" align="center" label="时刻名称"></el-table-column>
            <el-table-column prop="rangeTime" align="center" label="时间范围"></el-table-column>
            <el-table-column align="center" label="操作">
                <template slot-scope="scope">
                    <el-button icon="el-icon-edit" type="warning" size="mini" @click="openEdit(scope.row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
        <!-- 修改页面 -->
        <el-dialog title="修改时刻信息" :visible.sync="dialogFormVisible" :close-on-click-modal="false">
            <el-form :model="form">
                <el-form-item label="时刻编号：" label-width="120px">
                   <div v-text="form.id"></div>
                </el-form-item>
                <el-form-item label="时刻名称：" label-width="120px">
                    <div v-text="form.name"></div>
                </el-form-item>
                <el-form-item v-if="form.name === '上午'" label="时间范围：" label-width="120px">
                    <el-time-select
                        style="padding-right: 5px;"
                        v-model="form.startTime"
                        :picker-options="{
                            start: '6:00',
                            step: '00:30',
                            end: '12:00'
                        }"
                        placeholder="开始时间">
                    </el-time-select>
                    至
                    <el-time-select
                        style="padding-left: 5px;"
                        v-model="form.endTime"
                        :picker-options="{
                        start: '6:00',
                        step: '00:30',
                        end: '12:00',
                        minTime: form.startTime
                        }"
                        placeholder="结束时间">
                    </el-time-select>
                </el-form-item>
                <el-form-item v-if="form.name === '下午'" label="时间范围：" label-width="120px">
                    <el-time-select
                            style="padding-right: 5px;"
                            v-model="form.startTime"
                            :picker-options="{
                            start: '12:00',
                            step: '00:30',
                            end: '18:00'
                        }"
                            placeholder="开始时间">
                    </el-time-select>
                    至
                    <el-time-select
                            style="padding-left: 5px;"
                            v-model="form.endTime"
                            :picker-options="{
                        start: '12:00',
                        step: '00:30',
                        end: '18:00',
                        minTime: form.startTime
                        }"
                            placeholder="结束时间">
                    </el-time-select>
                </el-form-item>
                <el-form-item v-if="form.name === '晚上'" label="时间范围：" label-width="120px">
                    <el-time-select
                            style="padding-right: 5px;"
                            v-model="form.startTime"
                            :picker-options="{
                            start: '18:00',
                            step: '00:30',
                            end: '23:00'
                        }"
                            placeholder="开始时间">
                    </el-time-select>
                    至
                    <el-time-select
                            style="padding-left: 5px;"
                            v-model="form.endTime"
                            :picker-options="{
                        start: '18:00',
                        step: '00:30',
                        end: '23:00',
                        minTime: form.startTime
                        }"
                            placeholder="结束时间">
                    </el-time-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveSchedule">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    import Pagination from '../../components/Pagination'
    export default {
        name: 'ScheduleList',
        data() {
            return {
                searchParams: {
                },
                loading: true,
                tableData: [],
                pageParams: {
                    currentPage: 1,
                    pageSize: 5,
                    total: 0
                },
                form: {
                    id: '',
                    name: '',
                    startTime: '',
                    endTime: '',
                    rangeTime: ''
                },
                dialogFormVisible: false
            }
        },
        // 注册组件
        components: {
            Pagination
        },
        created() {
            this.getScheduleList();
        },
        methods: {
            openEdit(item){
                let timeArr = item.rangeTime.split('-');
                this.form = {...item, startTime: timeArr[0], endTime: timeArr[1]};
                this.dialogFormVisible = true;
            },
            saveSchedule() {
                this.form.rangeTime = this.form.startTime + '-' + this.form.endTime;
                this.$ajax.post("/schedule/save", this.form).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.$message.success(resp.msg);
                        this.dialogFormVisible = false;
                        this.getScheduleList();
                    }else{
                        this.$message.error(resp.msg);
                    }
                });
            },
            getScheduleList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize
                };
                this.loading = true;
                this.$ajax.post("/schedule/list", data).then((response)=>{
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
            changePagination(params) {
                this.pageParams.currentPage = params.currentPage;
                this.pageParams.pageSize = params.pageSize;
                this.getScheduleList();
            }
        }
    }
</script>

<style scoped>
    .user-search {
        margin-top: 20px;
    }
</style>


