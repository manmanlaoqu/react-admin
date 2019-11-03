import React from 'react'
import Layout from 'antd/lib/layout'
import { Pagination,Switch } from 'antd'

import AjaxTable from '../../lib/table/ajaxTable'
import Button from '../../lib/button'
import ScrollContainer from '../index'
import NewMember from '../../modal/newmember'
import FreshComponent from '../freshbind'
import Reload from '../reload'
import Utils from 'utils/utils'
import Storage from 'gc-storage/es5'


class GroupList extends FreshComponent {

    constructor(props) {
        super(props)
        this.state = {
            show: false,
            noselected: true,
            addForm: {},
            selectedRowKeys: [],
            loading: {},
            pageSize: Utils.PAGESIZE
        };
        let that = this
        this.data = {};
        this.columns = [{
            title: '姓名',
            dataIndex: 'userName',
            render: (userName, item) => { return userName }
        }, {
            title: '操作',
            render: (row) => { return <a href="javascript:void(0)" onClick={() => this.events.edit.bind(this, row)()}>修改</a> }
        }, {
            title: '所属角色',
            dataIndex: 'roleName',
        }, {
            title: '账号状态',
            dataIndex: 'status',
            render: (status,row) => { 
                if(Utils.getApi('团队列表','保存')){
                    return <Switch size="small"
                     defaultChecked={row.status==0}
                     onChange={(checked)=>{
                        row.status=row.status==0?1:0
                        Utils.request({
                            params: {
                                id:row.id,
                                status:checked?0:1
                            },
                            api: Utils.getApi('团队列表','保存'),
                            // success: function (data) {
                            //     that.refs.table.initTable();
                            // }
                        })
                     }}
                     />
                }
             }
        }, {
            title: '手机号',
            dataIndex: 'userPhone',
        }, {
            title: '身份证号',
            dataIndex: 'idCardNo',
        }, {
            title: '创建时间',
            dataIndex: 'createTime',
            render: (time) => { return new Date(time).format('yyyy-MM-dd hh:mm') }
        }, {
            title: '最后登录时间',
            dataIndex: 'latestLoginTime',
        }];
        this.getData = (params, call) => {
            let that = this;
            Utils.request({
                api: Utils.getApi('团队列表','列表'),
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


    onItemSelected(keys, list) {
        this.data.selected = list;
        if (list.length > 0) {
            this.setState({
                noselected: false,
                selectedRowKeys: keys
            })
        } else {
            this.setState({
                noselected: true,
                selectedRowKeys: keys
            })
        }
    }

    events = {
        checkDetail: function (item) {
            let that = this;
            Utils.request({
                api: Utils.getApi('团队列表','详情'),
                params: {
                    id: item.id
                },
                beforeRequest() {
                    that.pageLoading(true);
                },
                afterRequest() {
                    that.pageLoading(false);
                },
                success: function (data) {
                    Utils.modal({
                        title: 'title',
                        content: '<Vehicle data={{}}/>'
                    })
                }
            })
        },
        add: function () {
            let that = this;
            if (!that.state.roleList) {
                that.getRoleList(function () {
                    that.addMemberModal()
                })
            } else {
                that.addMemberModal()
            }
        },
        edit: function (user) {
            let that = this;
            if (!that.state.roleList) {
                that.getRoleList(function () {
                    that.addMemberModal(user)
                })
            } else {
                that.addMemberModal(user)
            }
        }
    }

    notifyChange(addForm) {
        this.addData = addForm;
    }

    addMemberModal(user) {
        let that = this;
        that.addData = {};
        if (user) {
            that.addData = {
                userName: user.userName,
                userPhone: user.userPhone,
                roleId: user.roleId,
                idCardNo: user.idCardNo,
                roleName: user.roleName
            }
        }
        Utils.modal({
            title: (user ? '修改员工' : '新增员工'),
            onOk: function (fn) {
                if (!that.addData.userName) {
                    Utils.Message.warning('请输入用户姓名！');
                    return
                }
                if (!Utils.PHONE_REG.test(that.addData.userPhone)) {
                    Utils.Message.warning('请输入正确的手机号！');
                    return false;
                }
                if (!Utils.IDCARD_REG.test(that.addData.idCardNo)) {
                    Utils.Message.warning('请输入正确的身份证号！');
                    return
                }
                if (!that.addData.roleId) {
                    Utils.Message.warning('请为用户分配角色！');
                    return
                }
                if (user) {
                    that.addData.id = user.id;
                }
                return Utils.request({
                    params: that.addData,
                    api: Utils.getApi('团队列表','保存'),
                    success: function (data) {
                        that.refs.table.initTable();
                    }
                })
            },
            onCancel: function () { },
            content: <NewMember user={user} notifyChange={this.notifyChange.bind(this)} roleList={this.state.roleList} />
        })
    }

    getRoleList(fn) {
        this.setState({
            roleList: Storage.get('roleList'),
            loading: {
                modal: false
            }
        }, function () {
            fn();
        })
    }

    render() {
        let that = this;
        const pagination = this.state.pagination || { total: 0, current: 0 };
        const content = (
            <Layout style={{ background: '#f5f5f5' }}>
                {/* <SidePage show={this.state.show} width={650} page={<OrderDtail/>}/> */}
                {/* <div className="list-search-box">
                    <div style={{ width: 'calc(100% - 200px)', display: 'inline-block' }}>
                        <SelectFilter text="所属角色" />
                    </div>
                    <div className="search-btn">
                        <Button className="common white search" text="清空" />
                        <Button className="common search" text="查询" />
                    </div>
                </div> */}
                <div className="mytablebox" style={{ padding: '12px' }}>
                    <AjaxTable ref="table"
                        onItemSelected={this.onItemSelected.bind(this)}
                        rowSelection={true}
                        selectedRowKeys={this.state.selectedRowKeys}
                        columns={this.columns}
                        getData={this.getData} 
                        onPaginationChange={(pagination) => {
                            this.setState({
                                pagination: pagination
                            })
                        }}keyField="id" />
                </div>
            </Layout>
        );
        return (
            <div style={{height:'100%'}}>
                <div className="list-ctrl-box"></div>
                <ScrollContainer isList loading={this.state.pageloading} style={{height:'calc(100% - 74px)'}} height={'0px'} content={content} />
                <div className="kc-table-foot">
                    <div className="table-ctrl-box">
                        {Utils.getApi('团队列表','保存') ? <Button loading={this.state.loading.modal} onClick={this.events.add.bind(this)} className="common " text="新增员工" /> : null}
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
        return <Reload {...this.props} component={GroupList} />
    }
}