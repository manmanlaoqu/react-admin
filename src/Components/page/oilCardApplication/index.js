import React from 'react';

import { Pagination } from 'antd';
import Layout from 'antd/lib/layout'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import InputFilter from '../../yg-lib/inputFilter'
import Button from '../../lib/button'
import AjaxTable from '../../lib/table/ajaxTable'
import ScrollContainer from '../index'
import Utils from 'utils/utils'


class OilCard extends FreshComponent {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: Utils.PAGESIZE
        }
        this.data = [];
        this.filters = {};
        this.columns = [{
            title: '序号',
            width: 200,
            dataIndex: 'index',
        }, {
            title: '油卡卡号',
            dataIndex: 'cardNumber',
            width: 200,
        }, {
            title: '余额',
            dataIndex: 'balance',
            width: 200,
        }]
        this.getData = (params, call) => {
            let that = this;
            let tableIndex = (params.pageNum - 1) * params.pageSize + 1;
            Utils.request({
                api: Utils.getApi('油卡管理', '列表'),
                params: params,
                success: function (data) {
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
                    call(r);
                }
            })
        }
    }

    updateFilters(key, val) {
        this.filters[key] = val;
    }

    search() {
        this.refs.table.setParam(this.filters);
        this.refs.table.initTable();
    }
    clean() {
        this.filters = {};
        this.refs.table.setParam({});
        this.refs.inputParam.clean();
    }


    render() {
        let that = this
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <div>
                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100vw - 200px)', display: 'inline-block' }}>
                        <InputFilter ref="inputParam" text="条件搜索" onChange={(e) => this.updateFilters.bind(this, 'cardNumber', e.target.value.replace(/\s+/g, ""))()} placeholder={'油卡卡号'} />
                    </div>
                    <div className="search-btn">
                        <Button onClick={this.clean.bind(this)} className="common white search" text="清空" style={{ marginRight: '10px' }} />
                        <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                    </div>
                </div>
                <Layout style={{ background: '#f5f5f5' }}>
                    <div className="mytablebox" style={{ padding: '12px', paddingTop: '0' }}>
                        <AjaxTable pageSize={10} ref="table"
                            getData={this.getData}
                            onPaginationChange={(pagination) => {
                                this.setState({
                                    pagination: pagination
                                })
                            }}
                            columns={this.columns} keyField="id" />
                    </div>
                </Layout >
            </div>
        );

        return <div style={{ height: '100%' }}>
            <div className="oilCard">
                <div style={{ color: "#ff7800" }}><i className='iconfont icon-gantanhao' style={{ marginRight: '5px' }}></i>油卡申请</div>
                <div style={{ margin: '5px 0' }}> <span className="margin30">油卡申请电话:</span><span>010-5082 2461</span></div>
                <div><span className="margin60">工作时间:</span><span>周一至周五，9:00~18:00</span></div>
            </div>
            <ScrollContainer loading={this.state.pageloading} style={{ height: 'calc(100% - 169px)' }} height={'0px'} content={content} />
            <div className="kc-table-foot">
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
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return <Reload {...this.props} component={OilCard} />
    }

}