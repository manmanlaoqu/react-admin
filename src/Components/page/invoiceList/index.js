import React from 'react';
import Layout from 'antd/lib/layout';
import {Pagination} from 'antd'
import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button';
import SelectFilter from '../../yg-lib/selectFilter';
import InputFilter from '../../yg-lib/inputFilter';
import MyRangerFilter from '../../yg-lib/rangePicker';
import ScrollContainer from '../index';
import Invoice from '../../modal/invoice';
import FreshComponent from '../freshbind';
import Reload from '../reload';
import Utils from 'utils/utils';


class InvoiceList extends FreshComponent {

    constructor(props) {
        super(props)
        this.state = {
            show: false,
            noselected: true,
            addForm: {},
            exporting: false,
            selectedRowKeys: [],
            pageSize: Utils.PAGESIZE
        };
        this.filters = {};
        this.data = {};
        this.columns = [
            {
                title: '申请开票时间',
                dataIndex: 'applyTime',
                render: (applyTime, row) => { return Utils.getApi('开票记录','开票详情') ? <a href="javascript:void(0)" onClick={this.events.checkDetail.bind(this, row)}>{applyTime}</a> : applyTime }
            }, {
                title: '发票类型',
                dataIndex: 'invoiceTypeName'
            }, {
                title: '开票金额（元）',
                dataIndex: 'price',
            }, {
                title: '受票方企业名称',
                dataIndex: 'companyName',
            }, {
                title: '纳税人识别码',
                dataIndex: 'taxpayerNo',
            }, {
                title: '联系电话',
                dataIndex: 'contactPhone',
            }, {
                title: '公司地址',
                dataIndex: 'companyAddress',
            }, {
                title: '发票内容',
                dataIndex: 'invoiceContent',
            }, {
                title: '申请状态',
                dataIndex: 'statusName',
            }];
        this.getData = (params, call) => {
            let that = this;

            Utils.request({
                api: Utils.getApi('开票记录','开票历史'),
                params: params,
                success: function (data) {
                    let r = {
                        list: data.data,
                        total: data.totalSize
                    }
                    that.data.tablelist = r;
                    call(r);
                }
            })
        }
    }

    init() {
        this.setState({
            show: false,
            noselected: true,
            addForm: {}
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

    events = {
        export: function () {
            let that = this;
            Utils.request({
                api: Utils.getApi('开票记录','开票历史'),
                beforeRequest() {
                    that.setState({
                        exporting: true,
                    })
                },
                afterRequest() {
                    that.setState({
                        exporting: false,
                    })
                },
                params: {
                    ids: that.state.selectedRowKeys.length > 0 ? that.state.selectedRowKeys.toString() : null,
                    ...that.filters,
                    pageNum: -1,
                    export: true
                },
                download: true,
                fileName:Date.now() + '.xls'
            })
        },
        refresh() {
            this.events.clean();
            this.events.search();
        },
        checkDetail: function (row) {
            let that = this;
            Utils.request({
                api: Utils.getApi('开票记录','开票详情'),
                params: {
                    id: row.invoiceId
                },
                beforeRequest() {
                    that.pageLoading(true);
                },
                afterRequest() {
                    that.pageLoading(false);
                },
                success: function (data) {
                    let title;
                    
                    switch (data.status) {
                        case 0:
                            title = <span className="verify-status waiting"><span className='detail'>发票详情</span> <span > <i className="iconfont icon-miaojiewait"></i>待审核</span></span>;
                            break;
                        case 1:
                            title = <span className="verify-status waiting"><span className='detail'>发票详情</span><span> <i className="iconfont icon-miaojiewait"></i>待审核</span> </span>;
                            break;
                        case 2:
                            title = <span className="verify-status success"><span className='detail'>发票详情</span> <span> <i className="iconfont icon-right"></i>审核通过</span></span>;
                            break;
                        case 4:
                            title = <span className="verify-status failed"><span className='detail'>发票详情</span> <span > <i className="iconfont icon-fail1f"></i>审核失败</span></span>;
                            break;
                        case 5:
                            title = <span className="verify-status failed"><span className='detail'>发票详情</span><span className="status"> <i className="iconfont icon-fail1f"></i>审核失败</span></span>;
                            break;
                        case 3:
                            title = <span className="verify-status success"><span className='detail'>发票详情</span><span className="status"> <i className="iconfont icon-right"></i>已开票</span></span>;
                            break;
                        default:
                            title = "";
                    }
                    Utils.modal({
                        title: <span style={{ fontSize: '12px' }}>{title}</span>,
                        noBtn: true,
                        width: 1024,
                        height:'calc(90vh)',
                        content: <Invoice invoice={data} />
                    })
                }
            })
        },
        search: function () {
            this.setState({
                selectedRowKeys: []
            })
            this.refs.table.setParam(this.filters);
            this.refs.table.initTable();
        },
        clean: function () {
            this.filters = {};
            this.refs.table.setParam({});
            for (let k in this.refs) {
                if (k.indexOf('filt_') > -1) {
                    this.refs[k].clean();
                }
            }
        }
    }

    notifyChange(addForm) {
        this.addData = addForm;
    }

    updateFilters(key, val) {
        this.filters[key] = val;
    }

    onItemSelected(keys, list) {
        this.setState({
            selectedRowKeys: keys
        })
    }

    render() {
        let that = this
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <div>
                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100vw - 300px)',width:'100%', display: 'inline-block' }}>
                        <MyRangerFilter
                            ref="filt_rangeParam"
                            onStartChange={(val) => this.updateFilters.bind(this, 'startDate', val ? (val.format('YYYY-MM-DD') + ' 00:00:00') : '')()}
                            onEndChange={(val) => this.updateFilters.bind(this, 'endDate', val ? (val.format('YYYY-MM-DD' + ' 23:59:59')) : '')()}
                            text="申请时间" />
                        <SelectFilter ref="filt_selectParam" handleChange={(e, v) => this.updateFilters.bind(this, 'invoiceStatus', e)()} list={Utils.INVOIVE_STATUS} field={'filts'} value={'text'} text="申请状态" />
                        <InputFilter ref="filt_inputParam" text="条件搜索" onChange={(e) => this.updateFilters.bind(this, 'keyword', e.target.value.replace(/\s+/g, ""))()} placeholder={'订单号'} /></div>
                    <div className="search-btn">
                        <Button onClick={this.events.clean.bind(this)} className="common white search" text="清空" />
                        <Button onClick={this.events.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>
                <Layout style={{ background: '#f5f5f5' }}>
                {/* <SidePage show={this.state.show} width={650} page={<OrderDtail/>}/> */}
                <div className="mytablebox" style={{ padding: '12px' }}>
                    <AjaxTable
                        ref="table"
                        rowSelection={true}
                        selectedRowKeys={this.state.selectedRowKeys}
                        columns={this.columns}
                        getData={this.getData}
                        onItemSelected={this.onItemSelected.bind(this)}
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
            <div style={{height:'100%'}}>
                <ScrollContainer isList loading={this.state.pageloading} style={{height:'calc(100% - 52px)'}} height={'0px'} content={content} />
                <div className="kc-table-foot">
                   <div className="table-ctrl-box">
                   <Button loading={this.state.exporting} onClick={this.events.export.bind(this)} className="common" text="导出" />
                 </div>
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
        return <Reload {...this.props} component={InvoiceList} />
    }
}