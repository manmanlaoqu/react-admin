import React from 'react';
import './index.scss';
import ScrollContainer from '../index';
import FreshComponent from '../freshbind';
import Utils from 'utils/utils';
import { Feedback, bankCharge, uploadModal as transfer } from '../../../rd/common'
import Reload from '../reload';
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'
import Button from '../../lib/button';
import ButtonP from '../../lib/button/promise';


import { Card } from 'antd'
// import echarts from 'echarts'
//按需导入
// import echartTheme from '../echartTheme'
import echarts from 'echarts/lib/echarts'
//导入饼图
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/markPoint'
import ReactEcharts from 'echarts-for-react'
import { relative } from 'path';


const IconInvoice = <svg width={44} height={44}>
    <desc>Created with Sketch.</desc>
    <defs>
        <linearGradient x1="50%" y1="3.76625723%" x2="50%" y2="100%" id="linearGradient-1">
            <stop stopColor="#AECAF4" offset="0%"></stop>
            <stop stopColor="#6F9EE4" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="首页" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="首页-暂无消息⭐️" transform="translate(-1104.000000, -143.000000)" fillRule="nonzero">
            <g id="Group-2-Copy" transform="translate(-2.000000, 0.000000)">
                <g id="发票-copy" transform="translate(1076.000000, 124.000000)">
                    <g id="账户余额-copy" transform="translate(30.000000, 19.000000)">
                        <g id="发票">
                            <circle id="Oval" fill="#E5EFFC" cx="22" cy="22" r="22"></circle>
                            <circle id="Oval-Copy" fill="url(#linearGradient-1)" cx="22" cy="22" r="17"></circle>
                            <g id="fapiao" transform="translate(14.000000, 15.000000)" fill="#FFFFFF">
                                <path d="M15.7457627,0 L2.95932203,0 C2.71186441,0 2.5,0.183589359 2.45762712,0.435369052 C2.28135593,1.50718122 1.46101695,2.35344074 0.420338983,2.5370301 C0.177966102,2.57899338 0,2.79755214 0,3.05282877 L0,10.9454228 C0,11.2006994 0.177966102,11.4192581 0.422033898,11.4629699 C1.46101695,11.6448108 2.28135593,12.4910703 2.45932203,13.5646309 C2.49998305,13.8164106 2.71355932,14 2.96101695,14 L15.7457627,14 C15.8864576,14 16,13.8828525 16,13.7377295 L16,13.3775446 C16,13.2551517 15.9169661,13.1502435 15.8,13.1222505 C15.4118814,13.0295816 15.1237458,12.6711452 15.1237458,12.2427701 C15.1237458,11.8143949 15.4118814,11.4559585 15.8,11.3632896 C15.9152542,11.3353316 16,11.2304234 16,11.1080305 L16,10.7583365 C16,10.6359435 15.9169661,10.5310353 15.8,10.5030598 C15.4118814,10.4103909 15.1237458,10.0519545 15.1237458,9.62357937 C15.1237458,9.1952042 15.4118814,8.83676783 15.8,8.74409891 C15.9152542,8.71612339 16,8.61121519 16,8.48882228 L16,8.13912826 C16,8.01673536 15.9169661,7.91182715 15.8,7.88385163 C15.4118814,7.79118272 15.1237458,7.43274635 15.1237458,7.00437118 C15.1237458,6.575996 15.4118814,6.21755964 15.8,6.12487324 C15.9152542,6.09689771 16,5.99198951 16,5.8695966 L16,5.51990259 C16,5.39750968 15.9169661,5.29260147 15.8,5.26462595 C15.4118814,5.17195704 15.1237458,4.81352067 15.1237458,4.3851455 C15.1237458,3.95677033 15.4118814,3.59833396 15.8,3.50566504 C15.9169492,3.47069564 16,3.36578744 16,3.24339453 L16,2.89370051 C16,2.77130761 15.9169661,2.6663994 15.8,2.63842388 C15.4118814,2.54575496 15.1237458,2.1873186 15.1237458,1.75894342 C15.1237458,1.33056825 15.4118814,0.972131885 15.8,0.87946297 C15.9152542,0.851487448 16,0.746579243 16,0.624186337 L16,0.262270513 C16,0.117147496 15.8864576,0 15.7457627,0 Z M11.6915424,6.4885725 L10.3627288,7.69501686 C10.2203559,7.82440365 10.159339,8.02198077 10.2051017,8.21258149 L10.5949322,9.87887349 C10.7000169,10.3282303 10.2305254,10.6884151 9.84238983,10.4541027 L8.38476271,9.57112527 C8.22545763,9.47495941 8.02883051,9.47495941 7.86952542,9.57112527 L6.41189831,10.4541027 C6.02542373,10.6883977 5.55423729,10.3282128 5.65932203,9.878856 L6.04915254,8.21256401 C6.09322034,8.02371175 6.03220339,7.82440365 5.89152542,7.69499938 L4.56271186,6.48855501 C4.22881356,6.1843387 4.40677966,5.61608592 4.85084746,5.57237417 L6.61864407,5.4010241 C6.80679661,5.3835394 6.96949153,5.25764956 7.04067797,5.07755714 L7.65762712,3.53190958 C7.83049153,3.098289 8.42542373,3.098289 8.59830508,3.53190958 L9.21523729,5.07755714 C9.28642373,5.25764956 9.44913559,5.38179093 9.63727119,5.4010241 L11.4050678,5.57237417 C11.8474576,5.61608592 12.0271186,6.1843387 11.6915424,6.4885725 Z" id="Shape"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>

const IconException = <svg width={44} height={44}>
    <title>异常</title>
    <desc>Created with Sketch.</desc>
    <defs>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="98.8777999%" id="linearGradient-2">
            <stop stopColor="#FBB7BA" offset="0%"></stop>
            <stop stopColor="#FD677B" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="首页" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="首页-暂无消息⭐️" transform="translate(-1104.000000, -269.000000)" fillRule="nonzero">
            <g id="Group-2-Copy" transform="translate(-2.000000, 0.000000)">
                <g id="发票-copy" transform="translate(1076.000000, 124.000000)">
                    <g id="账户余额" transform="translate(30.000000, 145.000000)">
                        <g id="异常">
                            <circle id="Oval" fill="#FCE6E9" cx="22" cy="22" r="22"></circle>
                            <circle id="Oval-Copy" fill="url(#linearGradient-2)" cx="22" cy="22" r="17"></circle>
                            <g id="yichang" transform="translate(14.000000, 14.000000)" fill="#FFFFFF">
                                <path d="M14.1884186,13.9911688 C15.8032124,13.9899811 16.4629404,12.8705399 15.6546724,11.5032502 L9.45937083,1.02491249 C8.65108526,-0.342411696 7.32990474,-0.341533838 6.52330853,1.0269264 L0.343844653,11.5138361 C-0.462663572,12.8825718 0.198806561,14.0012039 1.81360035,13.999999 L14.1883658,13.9911172 L14.1884186,13.9911688 Z M8.00923627,3.65039664 C8.65515027,3.65039664 9.13844633,4.94213897 9.08262725,6.52049335 L9.08262725,6.52391872 C9.02714253,8.10256573 8.96430208,9.39401544 8.94290359,9.39401544 C8.9215051,9.39401544 8.51834778,9.39401544 8.0468244,9.39401544 C7.57530102,9.39401544 7.14984774,9.39401544 7.10117323,9.39401544 C7.05242832,9.39401544 6.97257114,8.10227311 6.92379104,6.52328184 L6.92379104,6.52071712 C6.87479977,4.94201848 7.36328708,3.65031057 8.00923627,3.65031057 L8.00923627,3.65039664 Z M6.9082349,11.2249348 C6.9082349,10.6100382 7.41762797,10.1121206 8.04590933,10.1121206 C8.6741907,10.1121206 9.18358376,10.6100898 9.18358376,11.2249348 C9.18358376,11.8398313 8.6741907,12.337749 8.04590933,12.337749 C7.41757518,12.337749 6.9082349,11.8397797 6.9082349,11.2249348 Z" id="Shape"></path>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </g>
</svg>


class Home extends FreshComponent {

    constructor(props) {
        super(props);
        this.userModule = Storage.get('userModule');
    }

    componentWillMount() {
        let that = this;
        Events.bind('on首页Refresh', function () {
            try {
                that.props.reload();
            } catch (e) {

            }
        })
        Storage.watch('usableAmount', function (data) {
            that.setState({
                usableAmount: data
            })
        });
    }

    getHomePageData() {
        var that = this;
        Utils.request({
            api: '/api/web/enterprise/homePage',
            beforeRequest() {
                that.pageLoading(true);
            },
            afterRequest() {
                that.pageLoading(false);
            },
            success: function (data) {
                that.setState({
                    ...data,
                    usableAmount: Storage.get('usableAmount')
                }, () => {
                    Storage.set('abnormalOrderNum', data.abnormalOrderNum || 0)
                })
            }
        })
    }

    componentDidMount() {
        let that = this;
        that.getHomePageData()
        

    }
 

    goPage(type) {
        switch (type) {
            case 'invoice':
                Events.emit('addTab', { moduleText: '申请开票', module: '申请开票'})
                break
            case 'appeal':
                Events.emit('addTab', { moduleText: '订单管理', module: '订单管理', ext: { type: 'ABNORMAL', time: Date.now() } }, { event: 'filtOrderType', params: ['ABNORMAL'] })
                break
            case 'assign':
                Events.emit('addTab', { moduleText: '订单管理', module: '订单管理', ext: { type: 'WAIT_DISPATCH', time: Date.now() } }, { event: 'filtOrderType', params: ['WAIT_DISPATCH'] })
                break
            case 'verify':
                Events.emit('addTab', { moduleText: '订单管理', module: '订单管理', ext: { type: 'WAIT_IMPROVE', time: Date.now() } }, { event: 'filtOrderType', params: ['WAIT_IMPROVE'] })
                break
            case 'addDriver':
                Events.emit('addTab', { moduleText: '司机管理', module: '司机管理' }, { event: '司机详情Open' })
                break
            case 'addVehicle':
                Events.emit('addTab', { moduleText: '车辆管理', module: '车辆管理' }, { event: '车辆详情Open' })
                break
            case 'addPayee':
                Events.emit('addTab', { moduleText: '收款人管理', module: '收款人管理' }, { event: '收款人管理Open' })
                break
            case 'unpaid':
                Events.emit('addTab', { moduleText: '订单管理', module: '订单管理', ext: { type: 'WAIT_PAY', time: Date.now() } }, { event: 'filtOrderType', params: ['WAIT_PAY'] })
                break
            case 'exam':
                Events.emit('addTab', { moduleText: '付款审核', module: '付款审核' })
                break
            case 'pay':
                Events.emit('addTab', { moduleText: '运费支付', module: '运费支付' })
                break
            case 'goDriver':
                Events.emit('addTab', { moduleText: '司机管理', module: '司机管理' })
                break
            case 'goVehicle':
                Events.emit('addTab', { moduleText: '车辆管理', module: '车辆管理' })
                break
            case 'goPayee':
                Events.emit('addTab', { moduleText: '收款人管理', module: '收款人管理' })
                break
            default:
                break
        }
    }

    getOption = ()=>{
        var that=this
       let option = {
            tooltip: {
                trigger: 'item',
                formatter: "{b}: {c} ({d}%)",
            },
            color:['#E88F6F ', '#91C7AF '],
            legend: {
                orient: 'vertical',
                x: 'left',
                data:["司机","代收人"]
            },
            graphic: {
                type: 'text',
                left: 'center',
                top: 'center',
                style: {
                  textAlign: 'center',
                  fill: 'rgb(149,162,255)',
                  width: 15,
                  height: 15,
                  fontSize:12,
                }
              },
            series: [
                {
                    type:'pie',
                    radius: ['35%', '50%'],
                    avoidLabelOverlap: false,
                    center: ['30%','35%'],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '14',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data:[
                        {value:that.state.driverTotalAmount, name:'司机'},
                        {value:that.state.payeeTotalAmount, name:'代收人'}
                    ]
                }
            ]
        };
        
        return option;
    }
    render() {
        const content = <div>
            <div>
                <div className="home-top">
                    <div className="home-left">
                        <div className="left">
                            <div className="top">
                                <div className="content" style={{ paddingTop: 48,margin:'0 18%' }}>
                                    <div className="price-title">账户总余额</div>
                                    <div className="price total"><span className="price-tag">￥</span>{(new Number(this.state.rebateAmount||0) + new Number(this.state.usableAmount||0)).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="bottom">
                                <div className="content" style={{ paddingTop: 16,margin:'0 18%' }}>
                                  
                                    <Button
                                        onClick={() => transfer(null)}
                                        text={<span>对公转账</span>}
                                        className="common transfer" />
                                </div>
                            </div>
                        </div>
                        <div className="right">
                            <div className="top">
                                <div className="content" style={{ paddingTop: 24 }}>
                                    <div className="price-title">账户余额</div>
                                    <div className="price"><span className="price-tag">￥</span>{new Number(this.state.usableAmount||0).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="bottom">
                                <div className="content" style={{ paddingTop: 24 }}>
                                    <div className="price-title">返利余额</div>
                                    <div className="price"><span className="price-tag">￥</span>{new Number(this.state.rebateAmount||0).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="home-right">
                        <div className="top">
                            <div className="content">
                                <div className="icon-tag">
                                    <span className="icon">{IconInvoice}</span>
                                    <span className="title">可开发票金额</span>
                                    <span className="amount"><span className="price-tag">￥</span>{new Number(this.state.invoiceAbleAmount||0).toLocaleString()}</span>
                                </div>
                                <div className="tar"><span onClick={this.goPage.bind(this, 'invoice')} className="click-th-main">索取发票 ></span></div>
                            </div>
                        </div>
                        <div className="bottom">
                            <div className="content">
                                <div className="icon-tag">
                                    <span className="icon">{IconException}</span>
                                    <span className="title">待申诉异常订单</span>
                                    <span className="amount">{this.state.abnormalOrderNum}</span>
                                </div>
                                <div className="tar"><span onClick={this.goPage.bind(this, 'appeal')} className="click-th-main">运单申诉 ></span></div>
                            </div>
                        </div>
                    </div>
                    <div className="home-earhts" style={{width:"33%",height:"242px",marginLeft:"12px",background:"#fff",borderRadius:"10px",padding:"18px"}} >
                            <div className="content">
                                <div id="echarts" style={{position:"relative"}}>
                                <p style={{position:"absolute",top:"0px",left:"55%"}}>
                                   <p style={{fontSize:"14px"}}> 司机收款情况</p>
                                   <span style={{fontSize:"24px"}}> <span className="price-tag">￥</span>{this.state.driverTotalAmount}</span>
                                   
                                </p>
                                <p style={{position:"absolute",top:"130px",left:"55%"}}>
                                    <p style={{fontSize:"14px"}}>代收人收款情况</p>
                                    <span style={{fontSize:"24px"}} ><span className="price-tag">￥</span>{this.state.payeeTotalAmount}</span>
                                </p>
                                <ReactEcharts option={this.getOption()}/>
                                </div>
                            </div>
                    </div>
                </div>
                <div className="home-data-item">
                    <div className="content">
                        <div className="pannel-title">
                            <i className="iconfont icon-dingdanguanli1"></i>
                            <span>订单管理</span>
                        </div>
                        <div className="pannel-container">
                            <div className="pannel">
                                <div className="top">
                                    <span className="title">待派车订单</span>
                                    <span className="count" onClick={this.goPage.bind(this, 'assign')}>{this.state.newOrderNum}</span>
                                    <span className="button-link" onClick={this.goPage.bind(this, 'assign')} >去指派</span>
                                </div>
                            </div>
                            <div className="pannel">
                                <div className="top">
                                    <span className="title">待认证订单</span>
                                    <span className="count" onClick={this.goPage.bind(this, 'verify')}>{this.state.waitAuthOrderNum}</span>
                                    <span className="button-link" onClick={this.goPage.bind(this, 'verify')} >去认证</span>
                                </div>
                                <div className="bottom">
                                   
                                </div>
                            </div>
                            <div className="pannel">
                                <div className="top">
                                    <span className="title">待支付订单</span>
                                    <span className="count" onClick={this.goPage.bind(this, 'unpaid')}>{this.state.waitPayOrderTotalNum}</span>
                                    <span style={{display:"inline-block",width:'200px',height:"30px",lineHeight:"30px",textAlign:"center",background:"#fcf6ed",borderRadius:"21px",marginLeft:"20px"}}>待支付订单总金额:{this.state.waitPayOrderTotalAmount}</span>
                                   
                                </div>
                                <div className="bottom">
                                    <div className="item" onClick={this.goPage.bind(this, 'unpaid')}>
                                        <div>待申请订单</div>
                                        <div className="count">{this.state.waitApplayOrderNum}</div>
                                    </div>
                                    <div className="item" onClick={this.goPage.bind(this, 'exam')}>
                                        <div>待审核订单</div>
                                        <div className="count">{this.state.waitExamineOrderNum}</div>
                                    </div>
                                    <div className="item" onClick={this.goPage.bind(this, 'pay')}>
                                        <div>待结算订单</div>
                                        <div className="count">{this.state.waitPayOrderNum}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="home-data-item">
                    <div className="content">
                        <div className="pannel-title">
                            <i className="iconfont icon-ziyuanguanli"></i>
                            <span>运力管理</span>
                        </div>
                        <div className="pannel-container">
                            <div className="pannel">
                                <div className="top">
                                    <span className="title">司机管理</span>
                                    <span className="count" onClick={this.goPage.bind(this, 'goDriver')}>{this.state.companyDriverNum}</span>
                                    <span className="button-link" onClick={this.goPage.bind(this, 'addDriver')}>新增司机</span>
                                </div>
                                <div className="bottom">
                                    <div className="item">
                                        <div>司机未认证</div>
                                        <div className="count">{this.state.companyDriverUnAuthNum}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="pannel">
                                <div className="top">
                                    <span className="title">车辆管理</span>
                                    <span className="count" onClick={this.goPage.bind(this, 'goVehicle')}>{this.state.companyVehicleNum}</span>
                                    <span className="button-link" onClick={this.goPage.bind(this, 'addVehicle')}>新增车辆</span>
                                </div>
                                <div className="bottom">
                                    <div className="item">
                                        <div>车辆未认证</div>
                                        <div className="count">{this.state.companyVehicleUnAuthNum}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="pannel">
                                <div className="top">
                                    <span className="title">收款人管理</span>
                                    <span className="count" onClick={this.goPage.bind(this, 'goPayee')}>{this.state.companyPayeeNum}</span>
                                    <span className="button-link" onClick={this.goPage.bind(this, 'addPayee')}>新增收款人</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
           
        </div>
        return (
            <div style={{ background: '#f5f5f5', height: '100%', position: 'relative' }}>
                <div className='home-feedback' onClick={Feedback}>
                    <div><i className="iconfont icon-fankui"></i></div>
                    <div>反馈</div>
                </div>
                <ScrollContainer height={'0px'} content={content} />
            </div>
        )
    }
}


export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={Home} />
    }
}