<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>积分列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索筛选 -->
        <el-form :inline="true" :model="searchParams" class="user-search">
            <el-form-item label="搜索：">
                <el-input size="small" v-model="searchParams.userDTO.username" placeholder="输入用户昵称"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" @click="searchCreditItem" icon="el-icon-search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-table size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column align="center" prop="id" label="编号"></el-table-column>
            <el-table-column align="center" label="所属用户">
                <template slot-scope="scope">
                    <div>{{scope.row.userDTO.username}}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="积分变化数值">
                <template slot-scope="scope">
                    <div>{{scope.row.rate >= 0 ? '+' + scope.row.rate : scope.row.rate}}</div>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="nowRate" label="变化后的分数"></el-table-column>
            <el-table-column align="center" prop="description" label="详情描述"></el-table-column>
            <el-table-column align="center" prop="createTime" label="创建时间"></el-table-column>
            <el-table-column align="center" label="状态">
                <template slot-scope="scope">
                    <div v-if="scope.row.state === 1">执行结束</div>
                    <div v-if="scope.row.state === 2">已撤销</div>
                </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="225">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.state === 1" size="small" type="primary" icon="el-icon-refresh-right" @click="cancelCredit(scope.row)">撤销</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <Pagination :params="pageParams" @changePagination="changePagination"></Pagination>
    </div>
</template>

<script>
    import Pagination from '../../components/Pagination'
    export default {
        name: 'CreditList',
        data() {
            return {
                searchParams: {
                    userDTO: {
                        username: ''
                    }
                },
                loading: true,
                tableData: [],
                pageParams: {
                    currentPage: 1,
                    pageSize: 5,
                    total: 0
                },
            }
        },
        created() {
            // 获取信誉积分明细列表
            this.getCreditItemList();
        },
        // 注册组件
        components: {
            Pagination
        },
        methods: {
            changePagination(params) {
                this.pageParams.currentPage = params.currentPage;
                this.pageParams.pageSize = params.pageSize;
                this.getCreditItemList();
            },
            cancelCredit(item) {
                this.$confirm('确定要撤销编号为：' + item.id + ' 的记录吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$ajax.post("/user/cancelCreditItem", {id: item.id}).then((response)=>{
                        let resp = response.data;
                        if(resp.code === 0){
                            this.$message.success(resp.msg);
                            this.getCreditItemList();
                        }else{
                            this.$message.error(resp.msg);
                        }
                    });
                });
            },
            searchCreditItem() {
                this.pageParams.currentPage = 1;
                this.pageParams.pageSize = 5;
                this.getCreditItemList();
            },
            getCreditItemList() {
                let data = {
                    searchEntity: this.searchParams,
                    page: this.pageParams.currentPage,
                    size: this.pageParams.pageSize,
                    paging: 1
                };
                this.loading = true;
                this.$ajax.post("/user/viewCreditItem", data).then((response)=>{
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


