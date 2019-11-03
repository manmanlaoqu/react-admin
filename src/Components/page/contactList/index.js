import React from 'react';
import { Pagination } from 'antd';
import Layout from 'antd/lib/layout';
import Button from '../../lib/button';
import Utils from 'utils/utils';
import InputFilter from '../../yg-lib/inputFilter';
import AddContact from '../../modal/addContact';
import ScrollContainer from '../index';
import FreshComponent from '../freshbind';
import Reload from '../reload';
import Events from 'gc-event/es5'
import Storage from 'gc-storage/es5'

class ContactList extends FreshComponent {

    constructor(props) {
        super(props);
        this.state = {
            contactList: [],
            totalSize: 0,
            pageNum: 1
        }
        this.style = {
            item: { marginRight: '12px', display: 'inline-block', width: '100px', textAlign: 'right' },
            group: { margin: '20px', position: 'relative', padding: '16px 0', border: '2px solid #e8e8e8' },
            btnbox: { position: 'absolute', right: '0', bottom: '16px' }
        }
        this.pagination = {
            pageNum: 1,
            pageSize: 10
        }
    }
    componentDidMount() {
        // if (!this.inited && this.props.open && (Date.now() - this.props.time) < 500) {
        //     this.inited = true;
        //     this.modifyWrap();
        // }
        this.init(1);
    }


    init(page) {
        let that = this;
        this.pagination.pageNum = page;
        Utils.request({
            api: Utils.getApi('常用联系人', '列表'),
            params: this.pagination,
            beforeRequest() {
                that.pageLoading(true);
            },
            afterRequest() {
                that.pageLoading(false);
            },
            success: function (data) {
                Storage.set('addressList', data.data);
                that.setState({
                    contactList: data.data,
                    totalSize: data.totalSize,
                    pageNum: data.pageNum
                })
            }
        })
    }

    pageChange(page) {
        this.init(page)
    }

    componentWillMount() {
        let that = this;
        Events.bind('常用联系人Open', function () {
            that.modifyWrap();
        })
    }

    modifyWrap(contact) {
        let contactChosen;
        let that = this;
        if (contact) {
            contact.formatAddress = contact.provinceName + contact.cityName + contact.address
            contact.province = contact.provinceName
            contact.city = contact.cityName
        }
        Utils.modal({
            title: contact ? '修改联系人' : '新增联系人',
            width: 800,
            onOk: function () {
                if (!Utils.PHONE_REG.test(contactChosen.contactPhone)) {
                    Utils.Message.warning('请检查手机号！');
                    return;
                }
                if (!contactChosen.contactName || !contactChosen.contactName.replace(/\s+/g, "")) {
                    Utils.Message.warning('请输入用户名！');
                    return;
                }
                if (!contactChosen.address || !contactChosen.address.replace(/\s+/g, "")) {
                    Utils.Message.warning('请填写详细地址');
                    return;
                }
                let pos = Utils.bd_encrypt(contactChosen.longitude, contactChosen.latitude);
                return Utils.request({
                    api: Utils.getApi('常用联系人', '保存'),
                    params: {
                        companyId: Storage.get('companyConfig').companyId,
                        ...contactChosen,
                        lon: pos.lng,
                        lat: pos.lat,
                        contactName: contactChosen.contactName,
                        contactPhone: contactChosen.contactPhone,
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
            }} contact={contact || null} />,
        })
    }

    doDelete(id) {
        let that = this;
        Utils.confirm({
            title: '确认删除该联系人？',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                return Utils.request({
                    api: Utils.getApi('常用联系人', '删除'),
                    params: {
                        id: id,
                        deleted: 1
                    },
                    success: function (data) {
                        Utils.Message.success('删除成功！');
                        that.init(1);
                    }
                })
            }
        })
    }

    clean() {
        this.like1 = null;
        for (let k in this.refs) {
            if (k.indexOf('filt_') > -1) {
                this.refs[k].clean();
            }
        }
    }

    search() {
        this.pagination = {
            like1: this.like1, pageNum: 1,
            pageSize: 10
        };
        this.init(1);
    }

    render() {
        const list = this.state.contactList.map((contact, key) => {
            return (
                <div key={key} style={this.style.group}>
                    <div style={{ padding: '3px 0' }}>
                        <span style={this.style.item}>联系人：</span>{contact.contactName}
                    </div>
                    <div style={{ padding: '3px 0' }}>
                        <span style={this.style.item}>联系电话：</span>{contact.contactPhone}
                    </div>
                    <div style={{ padding: '3px 0' }}>
                        <span style={this.style.item}>地址：</span>{contact.provinceName}{contact.cityName}{contact.countryName}{contact.address}
                    </div>
                    {(Utils.getApi('常用联系人', '保存') && Utils.getApi('常用联系人', '删除')) ? <span style={this.style.btnbox}>
                        <span onClick={() => this.modifyWrap.bind(this, contact)()} style={{ padding: '0 16px', cursor: 'pointer', borderRight: '1px solid #333333', color: '#0099ff' }}>修改</span>
                        <span onClick={() => this.doDelete.bind(this, contact.id)()} style={{ padding: '0 16px', cursor: 'pointer' }}>删除</span>
                    </span> : ''
                    }
                    {(Utils.getApi('常用联系人', '保存') && !Utils.getApi('常用联系人', '删除')) ? <span style={this.style.btnbox}>
                        <span onClick={() => this.modifyWrap.bind(this, contact)()} style={{ padding: '0 16px', cursor: 'pointer', color: '#0099ff' }}>修改</span>
                    </span> : ''}
                    {(!Utils.getApi('常用联系人', '保存') && Utils.getApi('常用联系人', '删除')) ? <span style={this.style.btnbox}>
                        <span onClick={() => this.doDelete.bind(this, contact.id)()} style={{ padding: '0 16px', cursor: 'pointer' }}>删除</span>
                    </span> : ''}
                </div>
            )
        })
        const content = (
            <Layout style={{ background: '#f5f5f5' }}>
                <div style={{ margin: '12px', backgroundColor: '#fff' }}>

                    <div className="list-search-box">
                        <div style={{ display: 'inline-block' }}>
                            <InputFilter ref="filt_inputParam" text="条件搜索" onChange={(e) => this.like1 = e.target.value} placeholder={'联系人/联系电话'} /></div>
                        <div className="search-btn">
                            <Button onClick={this.clean.bind(this)} className="common white search" text="清空" />
                            <Button onClick={this.search.bind(this)} className="common search" text="查询" />
                        </div>
                    </div>
                    {list}
                </div>
            </Layout>
        );
        return (
            <div className="table-out-box" style={{ height: '100%' }}>
                <ScrollContainer init isList loading={this.state.pageloading} style={{ height: 'calc(100% - 52px)' }} height={'0px'} content={content} />
                <div className="kc-table-foot">
                    <div className="table-ctrl-box">
                        {Utils.getApi('常用联系人', '保存') ? <Button style={{ marginRight: '16px' }} className="common" onClick={this.modifyWrap.bind(this, null)} text="新增联系人" /> : ''}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="ajax-table-footer">
                            <span style={{ position: 'relative', top: '-10px', marginRight: '12px' }}>总计{this.state.totalSize}条</span>
                            <Pagination showQuickJumper style={{ display: 'inline-block' }} onChange={this.pageChange.bind(this)}
                                defaultCurrent={1} total={this.state.totalSize} />
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
        return <Reload {...this.props} component={ContactList} />
    }
}