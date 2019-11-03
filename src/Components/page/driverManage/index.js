//司机管理---menu
import React from 'react';
import Layout from 'antd/lib/layout';
//redux
import { Pagination } from 'antd'
import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button';
import SelectFilter from '../../yg-lib/selectFilter'
import InputFilter from '../../yg-lib/inputFilter'
import MyRangerFilter from '../../yg-lib/rangePicker'
import Utils from 'utils/utils'
import ScrollContainer from '../index'
import Add from '../../modal/newDriver'
import Driver from '../../modal/driver'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Highlight from '../../lib/highlight'
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'

let bankDataArr = [{
    field: 'bankIdCardNum',
    name: '收款人身份证号',
}, {
    field: 'bankAccountNo',
    name: '受支持的银行卡号'
}, {
    field: 'bankCardPhone',
    name: '收款人手机号'
}, {
    field: 'bankUserName',
    name: '收款人姓名'
}]

class DriverList extends FreshComponent {

    constructor(props) {
        super(props)
        this.state = {
            show: false,
            noselected: true,
            addData: {},
            loading: {},
            restifyModal: '',
            pageSize: Utils.PAGESIZE
        };
        this.filters = {};
        this.data = {};
        this.columns = [
            //     {
            //     title:'序号',
            //     dataIndex: 'index',
            // },
            {
                title: '司机姓名',
                dataIndex: 'name',
                render: (name, row) => {
                    return Utils.getApi('司机管理', '详情') ? <a href="javascript:void(0)" onClick={(e) => this.checkDetail.bind(this, row.id)()}><Highlight
                        str={name}
                        keyword={this.keyword}
                    /></a> : name
                }
            }, {
                title: '身份证号',
                dataIndex: 'idCardNum'
            }, {
                title: '联系电话',
                dataIndex: 'phone',
                render: (str) => {
                    return <Highlight
                        str={str}
                        keyword={this.keyword}
                    />
                }
            }, {
                title: '常跑线路',
                dataIndex: 'runLine',
            }, {
                title: '定位授权结果',
                dataIndex: 'locAuthStatus',
                render: (status, row) => {
                    let that = this;
                    return (function () {
                        switch (status) {
                            case 0:
                                return Utils.getApi('司机管理', '详情') ? <a className="dangerous" href="javascript:void(0)" onClick={(e) => that.checkDetail.bind(that, row.id)()}>未授权</a> : '未授权';
                            case 1:
                                return Utils.getApi('司机管理', '详情') ? <a href="javascript:void(0)" onClick={(e) => that.checkDetail.bind(that, row.id)()}>已授权</a> : '已授权';
                            case 2:
                                return Utils.getApi('司机管理', '详情') ? <a className="dangerous" href="javascript:void(0)" onClick={(e) => that.checkDetail.bind(that, row.id)()}>已拒绝</a> : '已拒绝';
                            default:
                                return Utils.getApi('司机管理', '详情') ? <a className="dangerous" href="javascript:void(0)" onClick={(e) => that.checkDetail.bind(that, row.id)()}>未授权</a> : '未授权';
                        }
                    })()
                }
            }, {
                title: '认证结果',
                dataIndex: 'driverAuthStatus',
                render: (driverAuthStatus) => {
                    return (function () {
                        switch (driverAuthStatus) {
                            case 1:
                                return '认证通过';
                            case 2:
                                return '认证中'
                            case 3:
                                return '认证失败';
                            default:
                                return '未认证';
                        }
                    })()
                }
            }, {
                title: '认证时间',
                dataIndex: 'auditTime',
                render: (auditTime) => {
                    if (auditTime) {
                        return auditTime.toString().replace('年', '-').replace('月', '-').replace('日', ' ')
                    }
                }
            },
            {
                title: '合同审核结果',
                dataIndex: 'contractAnthStatus',
                render: (contractAnthStatus) => {
                    return (function () {
                        switch (contractAnthStatus) {
                            case 0:
                                return '未审核';
                            case 1:
                                return '审核通过';
                            case 2:
                                return '审核中'
                            case 3:
                                return '审核拒绝';
                            case 4:
                                    return '已过期';   
                            default:
                                return '未认证';
                        }
                    })()
                }
            }
        ];
        this.getData = (params, call) => {
            let tableIndex = (params.pageNum - 1) * params.pageSize + 1;
            let that = this;
            Utils.request({
                api: Utils.getApi('司机管理', '列表'),
                params: params,
                success: function (data) {
                    console.log(data,"司机管理列表")
                    let list = data.data.map((item, index) => {
                        item.index = tableIndex;
                        tableIndex++;
                        return item;
                    })
                    let r = {
                        list: list,
                        total: data.totalSize
                    }
                    that.data.tablelist = r;
                    if (that.filters['like1']) {
                        that.keyword = that.filters['like1']
                    } else {
                        that.keyword = null
                    }
                    call(r);
                }

            })
        }
    }

    componentWillMount() {
        let that = this;
        Events.bind('司机详情Open', function (param) {
            if(param){
                that.checkDetail(param);
            }else{
                that.add();
            }
        })
    }

    init() {
        this.setState({
            show: false,
            noselected: true,
            addData: {}
        }, function () {
            this.refs.table.initTable();
        })
    }


    onItemSelected(key, list) {
        this.data.selected = list;
        if (list.length > 0) {
            this.setState({
                noselected: false
            })
        } else {
            this.setState({
                noselected: true
            })
        }
    }


    checkDetail(param) {
        let title, that = this, params, ban, id;

        let notify = function (data) {
            params = data;
        }
        let disabled = function (b0) {
            ban = b0
        }
        let vertifyBankData = function () {
            //填了收款人字段才校验收款人
            if (params.bankUserName ||
                params.bankAccountNo ||
                params.bankIdCardNum ||
                params.bankCardPhone) {
                for (let i = 0; i < bankDataArr.length; i++) {
                    if (!params[bankDataArr[i].field]) {
                        Utils.Message.warning('请填写' + bankDataArr[i].name + '！');
                        return false;
                    }
                }
                if (!Utils.PHONE_REG.test(params.bankCardPhone)) {
                    Utils.Message.warning('请输入正确的手机号！');
                    return false;
                }
                if (!Utils.IDCARD_REG.test(params.bankIdCardNum)) {
                    Utils.Message.warning('请输入正确的身份证号！');
                    return false
                }
            }
            return true;
        }
        if (Utils.PHONE_REG.test(param)) {
            param = {
                phone: param
            }
        } else {
            param = {
                id: param
            }
        }
        Utils.request({
            api: Utils.getApi('司机管理', '详情'),
            params: param,
            beforeRequest() {
                that.pageLoading(true);
            },
            afterRequest() {
                that.pageLoading(false);
            },
            success: function (data) {
                id = data.id
                let time = data.auditTime ? data.auditTime.toString().replace('年', '-').replace('月', '-').replace('日', ' ') : '';
                switch (data.driverAuthStatus) {
                    case 0:
                        title = <span className="verify-status waiting">司机详情 <span> <i className="iconfont icon-gantanhao"></i>未认证</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    case 2:
                        title = <span className="verify-status waiting">司机详情 <span> <i className="iconfont icon-miaojiewait"></i>认证中</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    case 1:
                        title = <span className="verify-status success">司机详情 <span> <i className="iconfont icon-right"></i>认证通过</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    case 3:
                        title = <span className="verify-status failed">司机详情 <span> <i className="iconfont icon-fail1f"></i>认证失败</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    default:
                        title = <span className="verify-status waiting">司机详情 <span> <i className="iconfont icon-miaojiewait"></i>待认证</span> <span style={{ color: 'black' }}>{time}</span></span>;
                }
                switch (data.contractAnthStatus) {
                    case 0:
                        title = <span className="verify-status waiting">司机详情 <span> <i className="iconfont icon-gantanhao"></i>未审核</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    case 2:
                        title = <span className="verify-status waiting">司机详情 <span> <i className="iconfont icon-miaojiewait"></i>审核中</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    case 1:
                        title = <span className="verify-status success">司机详情 <span> <i className="iconfont icon-right"></i>审核通过</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    case 3:
                        title = <span className="verify-status failed">司机详情 <span> <i className="iconfont icon-fail1f"></i>审核拒绝</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                     case 4:
                        title = <span className="verify-status failed">司机详情 <span> <i className="iconfont icon-fail1f"></i>已过期</span> <span style={{ color: 'black' }}>{time}</span></span>;
                        break;
                    default:
                        title = <span className="verify-status waiting">司机详情 <span> <i className="iconfont icon-miaojiewait"></i>未审核</span> <span style={{ color: 'black' }}>{time}</span></span>;
                }
                Utils.modal({
                    title: title,
                    noBtn: (data.driverAuthStatus == 1 || !Utils.getApi('司机管理', '保存')) ? true : false,
                    okText: '重新提交',
                    width: 810,
                    onOk() {
                        if (!params || ban) {
                            return;
                        }
                        let p = {
                            name: data.name,
                            phone: data.phone,
                            idCardImg1: data.idCardImg1,
                            idCardImg2: data.idCardImg2,
                            driverLicencePic: data.driverLicencePic,
                            idCardNum: data.idCardNum,
                            // bankAccountNo: data.bankAccountNo,
                            // bankUserName: data.bankUserName,
                            // bankIdCardNum: data.bankIdCardNum,
                            // bankCardPhone: data.bankCardPhone,
                            // bankCode: data.bankCode,
                            // bankName: data.bankName,
                            id: id
                        };
                        for (let k in params.driver) {
                            p[k] = params.driver[k];
                        }
                        if (!p.phone) {
                            Utils.Message.warning('请填写司机手机号！');
                            return;
                        }
                        if (!Utils.PHONE_REG.test(p.phone)) {
                            Utils.Message.warning('请填写正确的手机号！');
                            return false;
                        }
                        if (!p.name) {
                            Utils.Message.warning('请填写司机姓名！');
                            return;
                        }
                        vertifyBankData();
                        if (JSON.stringify(params.ext) === '{}') {
                            delete p['ext']
                        } else {
                            p.ext = JSON.stringify(params.ext)
                        }
                        return Utils.request({
                            params: p,
                            api: Utils.getApi('司机管理', '保存'),
                            success: function (data) {
                                that.refs.table.initTable();
                            },
                            handleError(responseHeasd) {
                                var msg = responseHeasd.head.errorMessage.split('bizId:')[0]
                                var id = responseHeasd.head.errorMessage.split('bizId:')[1]
                                that.refs.table.initTable();
                                Utils.Message.warning(msg)
                            }
                        })
                    },
                    content: <Driver queryApi={Utils.getApi('司机管理', '查询')}
                        disabled={disabled}
                        onParamSet={notify}
                        editable={(data.driverAuthStatus == 1 || !Utils.getApi('司机管理', '保存')) ? false : true}
                        driver={data} />
                })
            }
        })
    }
    add() {
        let that = this;
        that.addMemberModal()
    }
    search() {
        this.refs.table.setParam(this.filters);
        this.refs.table.initTable();
    }
    clean() {
        this.filters = {};
        this.refs.table.setParam({});
        for (let k in this.refs) {
            if (k.indexOf('filt_') > -1) {
                this.refs[k].clean();
            }
        }
    }

    notifyChange(addForm) {
        this.addData = addForm;
    }

    updateFilters(key, val) {
        this.filters[key] = val;
    }

    addMemberModal(isNotSame) {
        let that = this, ban,
            disabled = function (bo) {
                ban = bo;
            };
        that.addData = {};
        // var titleContent = <div><span>新增司机</span> <span style={{fontSize:'12px',display:'inline-block',backgroundColor:'#fbead0',width:'60%',padding:'6px 12px',marginLeft:'20px'}}><span className='iconfont icon-gantanhao' style={{color:'red',fontSize:'10px',marginRight:'5px'}}></span>身份证信息和驾驶证信息不匹配,会导致认证失败</span></div>
        var addDriveModal = Utils.modal({
            title: '新增司机',
            width: 800,
            okText: '提交',
            onOk: function (fn) {
                if (!that.addData) {
                    return;
                }
                if (ban) {//银行卡验证结果
                    return;
                }
                let vertify = function (param) {
                    if (!param['phone']) {
                        Utils.Message.warning('请填写司机手机号！');
                        return false;
                    }
                    if (!Utils.PHONE_REG.test(param['phone'])) {
                        Utils.Message.warning('请填写正确的手机号！');
                        return false;
                    }
                    if (!param['name']) {
                        Utils.Message.warning('请填写司机姓名！');
                        return false;
                    }
                    if (param.idCardNum && !Utils.IDCARD_REG.test(param.idCardNum)) {
                        Utils.Message.warning('请输入正确的身份证号！');
                        return false
                    }
                    if (!vertifyBankData(param)) {
                        return false;
                    }
                    return true;
                }

                let vertifyBankData = function (param) {
                    //填了收款人字段才校验收款人
                    if (param.bankUserName ||
                        param.bankAccountNo ||
                        param.bankIdCardNum ||
                        param.bankCardPhone) {
                        for (let i = 0; i < bankDataArr.length; i++) {
                            if (!param[bankDataArr[i].field]) {
                                Utils.Message.warning('请填写' + bankDataArr[i].name + '！');
                                return false;
                            }
                        }
                        if (!Utils.PHONE_REG.test(param.bankCardPhone)) {
                            Utils.Message.warning('请输入正确的手机号！');
                            return false;
                        }
                        if (!Utils.IDCARD_REG.test(param.bankIdCardNum)) {
                            Utils.Message.warning('请输入正确的身份证号！');
                            return false
                        }
                    }
                    return true;
                }
                let p = {
                    name: that.addData.name,
                    phone: that.addData.phone,
                    idCardImg1: that.addData.idCardImg1,
                    idCardImg2: that.addData.idCardImg2,
                    driverLicencePic: that.addData.driverLicencePic,
                    idCardNum: that.addData.idCardNum,
                    bankAccountNo: that.addData.bankAccountNo,
                    bankUserName: that.addData.bankUserName,
                    bankIdCardNum: that.addData.bankIdCardNum,
                    bankCardPhone: that.addData.bankCardPhone,
                    bankCode: that.addData.bankCode,
                    bankName: that.addData.bankName,
                    runLine: that.addData.runLine
                };
                //是否有修改过 如果isEditBankData为false，没有修改过
                if (!vertify(p)) {
                    return;
                }
                let reSendMsg = function (phone, callback) {
                    Utils.request({
                        api: '/api/external/common/lbs/opensms',
                        params: {
                            phone: phone
                        },
                        beforeRequest() {
                            that.setState({
                                pageloading: true,
                            })
                        },
                        afterRequest() {
                            that.setState({
                                pageloading: false,
                            })
                        },
                        success(data) {
                            callback();
                        }
                    });
                };
                let successFn = function (data) {
                    let apiMap = Storage.get('apiMap');
                    if (apiMap['车辆管理'] && apiMap['车辆管理']['添加']) {
                        var succeddModel = Utils.modal({
                            title: '添加成功',
                            cancelText: '知道了',
                            okText: '新增车辆',
                            width: 300,
                            content: '您还可以继续新增车辆',
                            onOk() {
                                succeddModel.destroy();
                                Storage.set('vehicleBindDriverId', data.id);
                                //跳转车辆
                                Events.emit('addTab', {
                                    moduleText: '车辆管理',
                                    module: '车辆管理'
                                }, {
                                        event: '车辆详情Open'
                                    })
                            }
                        })
                    } else {
                        var succeddModel = Utils.info({
                            title: '添加成功',
                            cancelText: '取消',
                            okText: '知道了',
                            width: 300,
                            content: '定位授权短信已发送，请及时回复Y授权手机定位！',
                        })
                    }
                }
                return Utils.request({
                    params: p,
                    api: Utils.getApi('司机管理', '保存'),
                    success: function (data) {
                        that.refs.table.initTable();
                        reSendMsg(p.phone, function () {
                            successFn(data)
                        })
                    },
                    handleError: function (responseHeasd) {
                        var msg = responseHeasd.head.errorMessage.split('bizId:')[0]
                        var id = responseHeasd.head.errorMessage.split('bizId:')[1]
                        that.refs.table.initTable();
                        if (responseHeasd.head.status == 2 || responseHeasd.head.errorMessage.indexOf('bizId') > -1) {
                            var msg = responseHeasd.head.errorMessage.split('bizId:')[0]
                            var id = responseHeasd.head.errorMessage.split('bizId:')[1]
                            var modal = Utils.modal({
                                title: '认证失败',
                                noBtn: responseHeasd.head.status == 2 ? true : false,
                                cancelText: msg == '稍后再说',
                                // okText:'重新编辑',
                                okText: '重新编辑',
                                width: 300,
                                // className:'restify',
                                onOk() {
                                    modal.destroy();
                                    that.checkDetail(id)
                                },
                                content: msg
                            })
                        } else {
                            Utils.Message.error(responseHeasd.head.errorMessage);
                        }
                    }
                })
            },
            onCancel: function () {

            },
            content: <Add disabled={disabled} notifyChange={this.notifyChange.bind(this)} />
        })
    }

    doExport() {
        Utils.request({
            api: Utils.getApi('司机管理', '查询'),
            params: {
                ...this.filters,
                pageNum: -1,
                export: true
            },
            download: true,
            fileName:Date.now() + '.xls'
        })
    }
    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <div>
                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100vw - 300px)', width: '100%', display: 'inline-block' }}>
                        <MyRangerFilter
                            ref="filt_rangeParam"
                            onStartChange={(val) => this.updateFilters.bind(this, 'startDate', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                            onEndChange={(val) => this.updateFilters.bind(this, 'endDate', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                            text="认证时间" />
                        <SelectFilter ref="filt_selectParam" handleChange={(e, v) => this.updateFilters.bind(this, 'authStatus', e)()} list={Utils.VERIFY_STATUS} field={'status'} value={'text'} text="认证结果" />
                        <SelectFilter ref="filt_selectParam1" handleChange={(e, v) => this.updateFilters.bind(this, 'locAuthStatus', e)()} list={Utils.LOC_STATUS} field={'status'} value={'text'} text="授权结果" />
                        <InputFilter ref="filt_inputParam" text=""
                            onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    this.search();
                                }
                            }}
                            onChange={(e) => this.updateFilters.bind(this, 'like1', e.target.value.replace(/\s+/g, ""))()}
                            placeholder={'司机姓名/手机号'} text="条件搜索" />
                    </div>
                    <div className="search-btn">
                        <Button onClick={this.clean.bind(this)} className="common white search" text="清空" />
                        <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>
                <Layout style={{ background: '#f5f5f5' }}>
                    {/* <SidePage show={this.state.show} width={650} page={<OrderDtail/>}/> */}

                    <div className="mytablebox" style={{ padding: '12px' }}>
                        <AjaxTable ref="table"
                            onItemSelected={this.onItemSelected.bind(this)}
                            columns={this.columns}
                            getData={this.getData}
                            onPaginationChange={(pagination) => {
                                this.setState({
                                    pagination: pagination
                                })
                            }}
                            keyField="id" />
                    </div>
                </Layout>
            </div>
        );
        return (
            <div style={{ height: '100%' }}>
                <ScrollContainer isList loading={this.state.pageloading} style={{ height: 'calc(100% - 52px)' }} height={'0px'} content={content} />
                <div className="kc-table-foot">
                    {Utils.getApi('司机管理', '保存') ? <div className="table-ctrl-box">
                        <Button loading={this.state.loading.modal} onClick={this.add.bind(this)} className="common " text="新增司机" />
                        {/* <Button style={{ marginRight: '12px' }} text="导出" className="common white" onClick={this.doExport.bind(this)} /> */}
                    </div> : null}
                    <div style={{ textAlign: 'right' }}>
                        <div className="ajax-table-footer">
                            <span style={{ position: 'relative', top: '-10px', marginRight: '12px' }}>总计{pagination.total}条</span>
                            <Pagination style={{ display: 'inline-block' }} pageSizeOptions={['10', '20', '30', '50', '100']}
                                showSizeChanger onChange={(page, pageSize) => {
                                    if (that.refs.table) {
                                        that.refs.table.handlePageChange(page, pageSize)
                                    }
                                }} showQuickJumper
                                pageSize={this.state.pageSize}
                                onShowSizeChange={(page, pageSize) => {
                                    that.setState({
                                        pageSize: pageSize
                                    })
                                    if (that.refs.table) {
                                        that.refs.table.handlePageChange(page, pageSize)
                                    }
                                }}
                                current={pagination.current} total={pagination.total} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default class extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <Reload {...this.props} component={DriverList} />
    }
}