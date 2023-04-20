<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="6">
                <el-card class="box-card">
                    <div slot="header" class="clear-fix">今日借阅数</div>
                    <div class="text item">
                        <i class="el-icon-present" style="vertical-align: middle"></i>
                        <span class="text">{{rentalTotal}}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="box-card">
                    <div slot="header" class="clear-fix">今日预约数</div>
                    <div class="text item">
                        <i class="el-icon-suitcase" style="vertical-align: middle"></i>
                        <span class="text">{{seatItemTotal}}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="box-card">
                    <div slot="header" class="clear-fix">图书数</div>
                    <div class="text item">
                        <i class="el-icon-notebook-1" style="vertical-align: middle"></i>
                        <span class="text">{{bookTotal}}</span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="6">
                <el-card class="box-card">
                    <div slot="header" class="clear-fix">用户数</div>
                    <div class="text item">
                        <i class="el-icon-user" style="vertical-align: middle"></i>
                        <span class="text">{{userTotal}}</span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <!-- 为 ECharts 准备一个具备大小（宽高）的 DOM -->
        <div id="main"></div>
    </div>
</template>

<script>
    import * as echarts from 'echarts'
    export default {
        name: 'DashBoard',
        data() {
            return {
                userTotal: 0,
                bookTotal: 0,
                seatItemTotal: 0,
                rentalTotal: 0
            }
        },
        created() {
            this.fetchAllInterface();
        },
        methods: {
            async fetchAllInterface() {
                await this.getUserTotal();
                await this.getBookTotal();
                await this.getSeatItemTotal();
                await this.getRentalTotal();
                this.initChart();
            },
            initChart() {
                let myChart = echarts.init(document.getElementById('main'));
                // 绘制图表
                myChart.setOption({
                    title: {
                        text: '统计'
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: ['今日借阅数', '今日预约数', '图书数', '用户数'],
                        axisTick: {
                            alignWithLabel: true
                        }
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [
                        {
                            type: 'bar',
                            barWidth: '25%',
                            label: {
                                show: true,
                                position: 'top'
                            },
                            data: [
                                {
                                    value: this.rentalTotal,
                                    itemStyle: { color: '#5470c6' }
                                },
                                {
                                    value: this.seatItemTotal,
                                    itemStyle: { color: '#91cc75' }
                                },
                                {
                                    value: this.bookTotal,
                                    itemStyle: { color: '#fac858' }
                                },
                                {
                                    value: this.userTotal,
                                    itemStyle: { color: '#ee6666' }
                                }
                            ]
                        }
                    ]
                })
            },
            getUserTotal() {
                return this.$ajax.post("/user/total").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.userTotal = resp.data;
                    }
                });
            },
            getBookTotal() {
                return this.$ajax.post("/book/total").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.bookTotal = resp.data;
                    }
                });
            },
            getSeatItemTotal() {
                return this.$ajax.post("/seat/dayTotal").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.seatItemTotal = resp.data;
                    }
                });
            },
            getRentalTotal() {
                return this.$ajax.post("/book/dayTotal").then((response)=>{
                    let resp = response.data;
                    if(resp.code === 0){
                        this.rentalTotal = resp.data;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .box-card {
        margin-bottom: 25px;
    }

    /deep/ .el-card__header {
        background: #FFB980;
    }

    .clear-fix {
        text-align: center;
        font-size: 15px;
    }

    .text {
        text-align: center;
        font-size: 24px;
        font-weight: 700;
        vertical-align: middle;
    }

    #main {
        width: 100%;
        height: 450px;
        margin-top: 20px;
    }

    .icon {
        width: 50px;
        height: 50px;
        padding-top: 5px;
        padding-right: 10px;
    }
</style>
