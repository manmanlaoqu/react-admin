
import React from 'react';
import Layout from 'antd/lib/layout'

import { Pagination } from 'antd'
import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button'
import MyRangerFilter from '../../yg-lib/rangePicker'
import InputFilter from '../../yg-lib/inputFilter'
import ScrollContainer from '../index';
import ModifyBankData from '../../modal/modifyBankData'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Utils from 'utils/utils'
import Highlight from '../../lib/highlight'
import Events from 'gc-event/es5'


class PayeeList extends FreshComponent {

    constructor(props) {
        super(props)
        this.state = {
            show: false,
            noselected: true,
            addForm: {},
            loading: {},
            pageSize: Utils.PAGESIZE
        };
        this.filters = {};
        this.data = {};
        this.columns = [
            {
                title: '姓名',
                dataIndex: 'name',
                render: (str) => {
                    return <Highlight
                        str={str}
                        keyword={this.keyword}
                    />
                }
            }, {
                title: '手机号',
                dataIndex: 'phone',
                render: (str) => {
                    return <Highlight
                        str={str}
                        keyword={this.keyword}
                    />
                }
            }, {
                title: '银行卡号',
                dataIndex: 'bankAccountNo',
                render: (str) => {
                    return <Highlight
                        str={str}
                        keyword={this.keyword}
                    />
                }
            }, {
                title: '银行名称',
                dataIndex: 'bankName'
            }, {
                title: '身份证',
                dataIndex: 'idCardNo',
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
                render: (createTime, row) => {
                    return new Date(createTime).format('yyyy-MM-dd hh:mm')
                }
            }];
        this.getData = (params, call) => {
            let that = this;
            Utils.request({
                api: Utils.getApi('收款人管理','列表'),
                params: params,
                success: function (data) {

                    let r = {
                        list: data.data,
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
        Events.bind('收款人管理Open', function (initData) {
            that.addpayeeModal(initData);
        })
    }


    // componentDidMount() {
    //     if (!this.inited && this.props.open && (Date.now() - this.props.time) < 500) {
    //         this.addpayeeModal();
    //     }
    // }

    init() {
        this.setState({
            show: false,
            noselected: true,
            addForm: {}
        }, function () {
            this.refs.table.initTable();
        })
    }

    updateFilters(key, val) {
        val = val === '全部' ? null : val;
        this.filters[key] = val;
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

    events = {
        add: function () {
            let that = this;
            that.addpayeeModal()
        }
    }

    doExport() {
        Utils.request({
            api: Utils.getApi('收款人管理','列表'),
            params: {
                ...this.filters,
                pageNum: -1,
                export: true
            },
            download: true,
            fileName:Date.now() + '.xls'
        })
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


    addpayeeModal(payee) {
        let payeeData = payee || {}
        var that = this;
        let onParam = function (data) {
            payeeData = data
        }
        let modal = Utils.modal({
            title: '新增收款人',
            width: '820px',
            content: <ModifyBankData bankData={payee} onParam={onParam} />,
            okText: '提交',
            cancelText: '取消',
            onOk: function () {
                if (!payeeData) {
                    Utils.Message.warning('请填写相关收款人信息')
                    return
                }
                if (!payeeData.bankUserName) {
                    Utils.Message.warning('请输入收款人姓名')
                    return
                }
                if (!payeeData.bankAccountNo) {
                    Utils.Message.warning('请输入收款人银行卡')
                    return
                }
                if (!payeeData.bankIdCardNum) {
                    Utils.Message.warning('请输入收款人身份证号')
                    return
                }
                if (!payeeData.bankCardPhone) {
                    Utils.Message.warning('请填写手机号')
                    return
                }
                if (!Utils.PHONE_REG.test(payeeData.bankCardPhone)) {
                    Utils.Message.warning('请填写正确的手机号')
                    return
                }
                modal.update({
                    okButtonProps: {
                        loading: true
                    }
                })
                Utils.request({
                    api: Utils.getApi('收款人管理','保存'),
                    params: {
                        name: payeeData.bankUserName,
                        phone: payeeData.bankCardPhone,
                        idCardNo: payeeData.bankIdCardNum,
                        bankAccountNo: payeeData.bankAccountNo,
                        bankCode: payeeData.bankCode,
                        bankName: payeeData.bankName
                    },
                    beforeRequest() {
                        that.setState({
                            listloading: true
                        })
                    },
                    afterRequest() {
                        that.setState({
                            listloading: false
                        })
                    },
                    success(data) {
                        //刷新列表
                        if (!data.msg) {
                            modal.destroy();
                            Utils.Message.success('新增收款人成功！')
                        } else {
                            Utils.Message.error('收款人信息有误')
                        }
                        that.refs.table.initTable();
                    },
                    handleError(result) {
                        Utils.Message.error(result.head.errorMessage)
                        modal.update({
                            okButtonProps: {
                                loading: false
                            }
                        })
                    }
                })


            },
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
                        <InputFilter ref="filt_inputParam"
                            onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    this.search();
                                }
                            }}
                            onChange={(e) => this.updateFilters.bind(this, 'like1', e.target.value.replace(/\s+/g, ""))()}
                            placeholder={'姓名/手机号/银行卡号'} text="条件搜索" />
                    </div>
                    <div className="search-btn">
                        <Button onClick={this.clean.bind(this)} className="common white search" text="清空" />
                        <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>
                <Layout style={{ background: '#f5f5f5' }}>
                    <div className="mytablebox" style={{ padding: '12px' }}>
                        <AjaxTable
                            ref="table" columns={this.columns}
                            getData={this.getData}
                            onPaginationChange={(pagination) => {
                                this.setState({
                                    pagination: pagination
                                })
                            }}
                            keyField="id" />
                    </div>
                </Layout >
            </div>
        );
        return (
            <div style={{height:'100%'}}>
                <ScrollContainer isList loading={this.state.pageloading} style={{height:'calc(100% - 52px)'}} height={'0px'} content={content} />
                <div className="kc-table-foot">
                    {Utils.getApi('收款人管理','保存') ? <div className="table-ctrl-box">
                        <Button loading={this.state.loading.modal} onClick={this.events.add.bind(this)} className="common " text="新增收款人" />
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
        return <Reload {...this.props} component={PayeeList} />
    }
}