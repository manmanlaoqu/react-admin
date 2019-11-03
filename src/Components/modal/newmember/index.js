import React from 'react';
import { Select } from 'antd';

const Option = Select.Option;
export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ...(this.props.user || {})
        }
    }

    input(val, key) {

        if (key === 'userPhone') {
            val = val.replace(/[^\d]/g, '')
        }
        if (key === 'idCardNo') {
            val = val.toIdcard()
        }
        this.state[key] = val;
        this.setState({
            ...this.state
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    onChange(roleId, obj) {
        this.setState({
            ...this.state,
            roleId: roleId,
            roleName: obj.roleName,
            remark: obj.remark
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    getData() {
        return this.state;
    }

    render() {
        return (
            <div className="ant-table ant-table-default">
                <div className="ant-table-content">
                    <div className="ant-table-body form-table">
                        <div className="group-head">
                            <span>
                                <div className="mod-form-title">员工信息</div>
                            </span>
                        </div>
                        <table>
                            <tbody className="ant-table-tbody">
                                <tr className="ant-table-row">
                                    <td className="head">
                                        <span className="title">姓名</span>
                                    </td>
                                    <td className="column">
                                        <input maxLength={20} placeholder="员工姓名"
                                            value={this.state.userName}
                                            onChange={(e) => this.input.bind(this, e.target.value, 'userName')()}
                                            type="text" />
                                    </td>
                                    <td className="head">
                                        <span className="title">手机号</span>
                                    </td>
                                    <td className="column">
                                        <input maxLength={11} placeholder="员工手机号"
                                            value={this.state.userPhone}
                                            onChange={(e) => this.input.bind(this, e.target.value.toNum(), 'userPhone')()}
                                            type="text" />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="head">
                                        <span className="title">身份证号</span>
                                    </td>
                                    <td className="column single" colspan={4}>
                                        <input maxLength={18}
                                            placeholder="身份证号"
                                            value={this.state.idCardNo}
                                            onChange={(e) => this.input.bind(this, e.target.value.toIdcard(), 'idCardNo')()}
                                            type="text" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="ant-table-body form-table">
                        {this.state.onDetail ? null : <div className="group-head">
                            <span>
                                <div className="mod-form-title">角色分配<span style={{ marginLeft: '16px', fontSize: '12px' }}></span></div>
                            </span>
                        </div>}
                        <table>
                            <tbody className="ant-table-tbody">
                                <tr className="ant-table-row">
                                    <td className="head">
                                        <span className="title">所属角色</span>
                                    </td>
                                    <td className="column single">
                                        <Select disabled={this.state.userType === 1}
                                            className="form-selector"
                                            value={this.state.roleId}
                                            onChange={(val, event) => {
                                                this.onChange.bind(this, val, event.props.item)()
                                            }}
                                            style={{ width: '100%', border: 'none' }}>
                                            {
                                                this.props.roleList.map((item) => {
                                                    return (
                                                        <Option key={item.id} item={item} value={item.id}>{item.roleName}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </td>
                                </tr>
                                <tr className="ant-table-row">
                                    <td className="head">
                                        <span className="title">对应权限</span>
                                    </td>
                                    <td className="column single">
                                        <input readOnly value={this.state.remark} type="text" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}