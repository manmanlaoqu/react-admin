//车辆管理
import React from 'react';
import Layout from 'antd/lib/layout';

import { Pagination } from 'antd';
import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button';
import MyRangerFilter from '../../yg-lib/rangePicker';
// // const TabPane = Tabs.TabPane;
import Utils from 'utils/utils';
import ScrollContainer from '../index';
import Vehicle from '../../modal/newVehicle';
import FreshComponent from '../freshbind';
import InputFilter from '../../yg-lib/inputFilter';
import Reload from '../reload';
import Events from 'gc-event/es5';
import Storage from 'gc-storage/es5';


class CarList extends FreshComponent {

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
            //     {
            //     title: '申请时间',
            //     dataIndex: 'applyTime'
            // }, 
            {
                title: '车牌号码',
                dataIndex: 'vehicleNo',
                render: (vehicleNo, row) => { return Utils.getApi('车辆管理', '详情') ? <a href="javascript:void(0)" onClick={() => this.events.checkDetail.bind(this, row.id)()} >{vehicleNo}</a> : vehicleNo }
            }, {
                title: '车型',
                dataIndex: 'vehicleTypeName'
            }, {
                title: '车长',
                dataIndex: 'vehicleLen'
            }, {
                title: '吨位',
                dataIndex: 'vehicleTon',
            }, {
                title: '认证结果',
                dataIndex: 'vehicleAuthStatus',
                render: (vehicleAuthStatus) => {
                    return (function () {
                        switch (vehicleAuthStatus) {
                            case 0:
                                return '未认证';
                            case 1:
                                return '认证通过';
                            case 2:
                                return '认证中';
                            case 3:
                                return '认证失败';
                            default:
                                return '未知';
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
            }
        ];
        this.getData = (params, call) => {
            let that = this;
            Utils.request({
                api: Utils.getApi('车辆管理', '列表'),
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

    componentWillMount() {
        let that = this;
        Events.bind('车辆详情Open', function (id) {
            if(id){
                that.events.checkDetail.bind(that, id)();
            }else{
                that.addVehicleModal();
            }
        })
    }


    // componentDidMount() {
    //     if (!this.inited && this.props.open && (Date.now() - this.props.time) < 500) {
    //         this.addVehicleModal();
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
        checkDetail: function (id) {
            let that = this;
            Utils.request({
                api: Utils.getApi('车辆管理', '详情'),
                params: {
                    id: id
                },
                beforeRequest() {
                    that.pageLoading(true);
                },
                afterRequest() {
                    that.pageLoading(false);
                },
                success: function (data) {
                    that.addVehicleModal(data)
                },
            })
        },
        add: function () {
            let that = this;
            that.addVehicleModal()
        }
    }
    
    doExport() {
        Utils.request({
            api: Utils.getApi('车辆管理', '列表'),
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

    addVehicleModal(vehicle) {
        // alert(Storage.get('vehicleBindDriverId'));
        // return
        let title;
        if (vehicle) {
            vehicle.applyTime = (vehicle.applyTime || new Date().format('yyyy-MM-dd hh:mm')).replace('年', '-').replace('月', '-').replace('日', ' ')
            switch (vehicle.vehicleAuthStatus) {
                case 1:
                    title = <span className="verify-status success">车辆详情 <span> <i className="iconfont icon-right"></i>认证通过</span> <span style={{ color: 'black' }}>{vehicle.applyTime
                    }</span></span>;
                    break;
                case 3:
                    title = <span className="verify-status failed">车辆详情 <span> <i className="iconfont icon-fail1f"></i>认证失败</span> <span style={{ color: 'black' }}>{vehicle.applyTime
                    }</span></span>;
                    break;
                case 2:
                    title = <span className="verify-status waiting">车辆详情 <span> <i className="iconfont icon-miaojiewait"></i>认证中</span> <span style={{ color: 'black' }}>{vehicle.applyTime
                    }</span></span>;
                    break;
                default:
                    title = <span className="verify-status waiting">车辆详情 <span> <i className="iconfont icon-gantanhao"></i>未认证</span><span style={{ color: 'black' }}>{vehicle.applyTime}</span></span>;
            }
        }
        let that = this;
        let modal = Utils.modal({
            title: vehicle ? title : '新增车辆',
            width: 800,
            noBtn: (vehicle && vehicle.vehicleAuthStatus === 1) ? true : false,
            okText: vehicle ? '重新提交' : '提交',
            onOk: function (fn) {
                return Vehicle.save(function () {
                    that.refs.table.initTable();
                    Utils.Message.success('添加成功！')
                    modal.destroy();
                });

            },
            onCancel: function () {
                Storage.set('vehicleBindDriverId', null)
            },
            content: <Vehicle
                driverId={Storage.get('vehicleBindDriverId')}
                api={Utils.getApi('车辆管理', '保存')}
                checkDetail={this.events.checkDetail.bind(this)}
                vehicle={vehicle}
            />
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
                        {/* <SelectFilter ref="filt_selectParam" handleChange={(e, v) => this.updateFilters.bind(this, 'authStatus', e)()} list={Utils.VERIFY_STATUS} field={'status'} value={'text'} text="认证结果" />

                        <SelectFilter ref="filt_selectCarType" handleChange={(e, v) => this.updateFilters.bind(this, 'vehicleTypeName', e)()} list={[{ value: '全部' }].concat(Storage.get('vehicleTypeOption'))} field={'value'} value={'value'} text="车型" />
                        <SelectFilter ref="filt_selectParamCarLength" handleChange={(e, v) => this.updateFilters.bind(this, 'vehicleLen', e)()} list={[{ value: '全部' }].concat(Storage.get('vehicleLengthOption'))} field={'value'} value={'value'} text="车长" />
                        <SelectFilter ref="filt_selectParamCarWeighth" handleChange={(e, v) => this.updateFilters.bind(this, 'vehicleTon', e)()} list={[{ name: '全部' }].concat(Storage.get('vehicleWeightOption'))} field={'value'} value={'name'} text="吨位" /> */}
                        <InputFilter ref="filt_inputParam" onChange={(e) => this.updateFilters.bind(this, 'like1', e.target.value.replace(/\s+/g, ""))()} placeholder={'车牌号'} text="条件搜索" />
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
                    {Utils.getApi('车辆管理','保存') ? <div className="table-ctrl-box">
                        <Button loading={this.state.loading.modal} onClick={this.events.add.bind(this)} className="common " text="新增车辆" />
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
        return <Reload {...this.props} component={CarList} />
    }
}