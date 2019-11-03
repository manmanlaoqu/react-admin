
import React from 'react';
import Layout from 'antd/lib/layout'

import { Pagination } from 'antd'
import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button'
import MyRangerFilter from '../../yg-lib/rangePicker'
import InputFilter from '../../yg-lib/inputFilter'
import ScrollContainer from '../index';
import AddContact from '../../modal/addContact';
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Storage from 'gc-storage/es5'
import Utils from 'utils/utils'
import Highlight from '../../lib/highlight'


const style = {
    maxWidth: 'calc(100% - 120px)',
    display: 'inline-block',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
}

class InvAddressList extends FreshComponent {

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
                title: '收件人',
                dataIndex: 'contactName',
                render: (str) => {
                    return <Highlight
                        str={str}
                        keyword={this.keyword}
                    />
                }
            }, {
                title: '联系电话',
                dataIndex: 'contactPhone',
                render: (str) => {
                    return <Highlight
                        str={str}
                        keyword={this.keyword}
                    />
                }
            }, {
                title: '地址',
                render: (row) => {
                    return <span>
                        <span style={style}>
                            <Highlight
                                str={row.provinceName + row.cityName + (row.countryName || '') + row.address}
                                keyword={this.keyword}
                            /></span>
                        {row.isPrimary ? <span style={{ border: '1px solid #ff7800', color: '#ff7800', marginLeft: '24px', borderRadius: '3px', padding: '2px 4px' }}>默认邮寄地址</span> : null}
                    </span>
                }
            }, {
                title: '操作',
                render: (row) => {
                    return <span><a onClick={this.modifyWrap.bind(this, row)}>修改</a><a style={{ marginLeft: '24px' }} onClick={this.remove.bind(this, row)}>删除</a></span>
                }
            }];
        this.getData = (params, call) => {
            let that = this;
            Utils.request({
                api: Utils.getApi('邮寄地址管理', '列表') || '/api/web/invoice/address/list',
                // api: '/api/web/invoice/address/list',
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

    remove(contact) {
        let that = this
        Utils.confirm({
            title: '确认删除该邮寄地址？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                return Utils.request({
                    api: Utils.getApi('邮寄地址管理', '保存'),
                    params: {
                        id: contact.id,
                        deleted: 1
                    },
                    success: function (data) {
                        Utils.Message.success('删除成功！');
                        that.init();
                    }
                })
            }
        })
    }

    modifyWrap(contact) {
        let contactChosen;
        let that = this;
        if (contact) {
            contact.formatAddress = contact.provinceName + contact.cityName + (contact.countryName || '') + contact.address
        }
        Utils.modal({
            title: contact ? '修改邮寄地址' : '新增邮寄地址',
            width: 800,
            onOk: function () {
                if (!contactChosen.contactName || !contactChosen.contactName.replace(/\s+/g, "")) {
                    Utils.Message.warning('请输入联系人姓名！');
                    return;
                }
                if (!contactChosen.provinceName || !contactChosen.cityName) {
                    Utils.Message.warning('请选择省市');
                    return;
                }
                if (!contactChosen.address || !contactChosen.address.replace(/\s+/g, "")) {
                    Utils.Message.warning('请填写地址');
                    return;
                }
                return Utils.request({
                    api: Utils.getApi('邮寄地址管理', '保存'),
                    params: {
                        companyId: Storage.get('companyConfig').companyId,
                        ...contactChosen,
                        contactName: contactChosen.contactName,
                        contactPhone: contactChosen.contactPhone,
                        isPrimary: contactChosen.isPrimary ? 1 : 0,
                        id: contactChosen.id
                    },
                    success: function (data) {
                        Utils.Message.success('保存成功！');
                        that.init();
                    }
                })
            },
            onCancel: function () {

            },
            content: <AddContact notifyChange={(contact) => {
                contactChosen = contact
            }} noLoc contact={contact || null} />,
        })
    }

    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <div>
                <div className="list-search-box">
                    <div style={{ maxWidth: 'calc(100vw - 300px)', width: '100%', display: 'inline-block' }}>
                        <InputFilter ref="filt_inputParam"
                            onKeyDown={(e) => {
                                if (e.keyCode === 13) {
                                    this.search();
                                }
                            }}
                            onChange={(e) => this.updateFilters.bind(this, 'like1', e.target.value.replace(/\s+/g, ""))()}
                            placeholder={'收件人/联系电话/地址'} text="条件搜索" />
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
            <div style={{ height: '100%' }}>
                <ScrollContainer isList loading={this.state.pageloading} style={{ height: 'calc(100% - 52px)' }} height={'0px'} content={content} />
                <div className="kc-table-foot">
                    {/* {Utils.getApi('邮寄地址管理','保存') ?  */}
                    <div className="table-ctrl-box">
                        <Button loading={this.state.loading.modal} onClick={this.modifyWrap.bind(this, null)} className="common " text="新增邮寄地址" />
                    </div>
                    {/* //  : null} */}
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
        return <Reload {...this.props} component={InvAddressList} />
    }
}