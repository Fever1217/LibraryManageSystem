<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home/dash-board' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>选座页面</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 搜索筛选 -->
        <el-form :inline="true" :model="searchParams" class="user-search">
            <el-form-item label="搜索：">
                <el-date-picker
                        value-format="yyyy-MM-dd"
                        format="yyyy-MM-dd"
                        size="small"
                        v-model="searchParams.openTime"
                        type="date"
                        :picker-options="pickerOptions"
                        :clearable="false"
                        :editable="false">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchParams.scheduleId" size="small" placeholder="请选择时刻">
                    <el-option v-for="(item, index) in scheduleList" :key="index" :label="item.name + '(' + item.rangeTime + ')'" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button size="small" type="primary" icon="el-icon-search" @click="searchByTime">搜索</el-button>
                <el-button size="small" v-if="loginUser.roleId === 1" type="primary" icon="el-icon-date" @click="pickOrderSeat">预约</el-button>
            </el-form-item>
        </el-form>
        <el-table :key="index" v-if="seat.row !== 0 && seat.col !== 0" size="small" :data="tableData" v-loading="loading" border element-loading-text="拼命加载中" style="width: 100%;">
            <el-table-column width="55">
                <template slot-scope="scope">
                    <span style="color: #909399; font-weight: bold;">第{{scope.$index + 1}}行</span>
                </template>
            </el-table-column>
            <el-table-column :width="seat.col > 9 ? 150 : ''" v-for="n in seat.col" :key="n"  align="center" :label="'第' + n + '列'" >
                <template slot-scope="scope">

                    <el-badge v-if="scope.row.picked[n-1] === 0" type="danger" value="占座" style="margin-top: 10px">
                        <img style="width: 30px; height: 30px; margin-top: 10px"
                             src="../../assets/img/sold_seat.jpg" />
                        <div>第{{scope.$index + 1}}行第{{n}}列</div>
                    </el-badge>
                    <el-badge v-else-if="scope.row.picked[n-1] === 1" type="primary" value="可选" style="margin-top: 10px">
                        <div @click="pickSeat(scope.$index, n-1)">
                            <img style="width: 30px; height: 30px; margin-top: 10px"
                                 src="../../assets/img/selectable_seat.jpg" />
                            <div>第{{scope.$index + 1}}行第{{n}}列</div>
                        </div>
                    </el-badge>
                    <el-badge v-else-if="scope.row.picked[n-1] === 2" type="success" value="选中" style="margin-top: 10px">
                        <div @click="cancelSeat(scope.$index + 1, n)">
                            <img style="width: 30px; height: 30px; margin-top: 10px"
                                 src="../../assets/img/selected_seat.jpg" />
                            <div>第{{scope.$index + 1}}行第{{n}}列</div>
                        </div>
                    </el-badge>
                </template>
            </el-table-column>
        </el-table>

        <el-empty v-else :image-size="200"></el-empty>
    </div>
</template>

<script>
    export default {
        name: 'PickList',
        data() {
            return {
                pickerOptions: {
                    disabledDate: (time) => {
                        return time.getTime() < Date.now() - 8.64e7
                    }
                },
                searchParams: {
                    openTime: '',
                    scheduleId: ''
                },
                seat: {
                    row: 0,
                    col: 0
                },
                scheduleList: [],
                loading: false,
                tableData: [],
                pickSeatList: [],
                seatItemList: [],
                index: 0,
                loginUser: {}
            }
        },
        created() {
            this.searchParams.openTime = this.getNowDay();
            this.getLoginUser();
            this.getAllScheduleList();
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
            pickSeat(row, col) {
                if(this.pickSeatList.length >= 1) {
                    this.$message.warning("一次最多只能选1个座位！");
                    return false;
                }
                this.tableData[row].picked[col] = 2;
                // 动态刷新表格
                this.index = this.index + 1;
                this.pickSeatList.push({row: row + 1, col: col + 1});
            },
            cancelSeat(row, col) {
                this.tableData[row-1].picked[col-1] = 1;
                // 动态刷新表格
                this.index = this.index + 1;
                let nowSeatList = [];
                this.pickSeatList.forEach(item => {
                    if(item.col !== col || item.row !== row) {
                        nowSeatList.push(item);
                    }
                });
                this.pickSeatList = nowSeatList;
            },
            getSeatBySearch() {
                this.loading = true;
                this.$ajax.post("/seat/getByTime", this.searchParams).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        if(resp.data) {
                            this.seat = resp.data;
                            this.getSeatItem();
                        } else {
                            this.seat = {row: 0, col: 0};
                        }
                    }
                });
            },
            initSeatDetailList() {
                this.tableData = [];
                for(let i=1; i<=this.seat.row; i++) {
                    let item = {picked: []};
                    for(let j=1; j<=this.seat.col; j++) {
                        item.picked.push(this.isPicked(i, j));
                    }
                    this.tableData.push(item);
                }
                this.loading = false;
            },
            isPicked(row, col) {
                let result = 1;
                this.seatItemList.forEach(item => {
                    if(item.row === row && item.col === col) {
                        result =  0; // 已被占座
                    }
                });
                return result; // 未被占座
            },
            getSeatItem() {
                this.$ajax.post("/seat/getItemBySeatId", {id: this.seat.id}).then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.seatItemList = resp.data;
                        this.initSeatDetailList();
                    } else {
                        this.$message.error(resp.msg);
                    }
                });
            },
            pickOrderSeat() {
                 if(this.pickSeatList.length === 0) {
                     this.$message.warning("请至少选择一个座位！");
                     return false;
                 }
                 let seat = this.pickSeatList[0];
                 this.$confirm('确定要预约第'+ seat.row +'行第'+ seat.col +'列的座位？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                 }).then(() => {
                     this.$ajax.post("/seat/pick", {...seat, seatId: this.seat.id, userId: this.loginUser.id}).then((response)=>{
                         let resp = response.data;
                         if(resp.code === 0){
                             this.$message.success(resp.msg);
                             this.getSeatBySearch();
                             this.pickSeatList = [];
                         } else {
                             this.$message.error(resp.msg);
                         }
                     });
                 });
            },
            searchByTime() {
                this.$confirm('搜索将导致当前选中的记录丢失，确认继续此操作？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.pickSeatList = [];
                    this.getSeatBySearch();
                });
            },
            getAllScheduleList() {
                this.$ajax.post("/schedule/all").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.scheduleList = resp.data;
                        this.searchParams.scheduleId = this.scheduleList[0] ? this.scheduleList[0].id : '';
                        this.getSeatBySearch();
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
    /deep/ .el-table tbody tr:hover>td {
        background-color:unset !important
    }
</style>


