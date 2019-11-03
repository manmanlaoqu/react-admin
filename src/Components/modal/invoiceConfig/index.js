import React from 'react';
import Loading from '../../lib/loading';

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.state = props||{}
        this.modifyParam = {...this.props||{}};
    }

    recordModify(val, key) {
        this.modifyParam[key] = val;
        this.state = this.modifyParam;
        this.props.onParam(this.modifyParam);
        this.update();
    }

    update() {
        this.setState({
            ...this.state,
        })
    }

    render() {
        const data = this.state;
        return (
            <div>
                <div className="ant-table ant-table-default">
                    <div className="ant-table-content">
                        <div className="ant-table-body form-table">
                            <div className="group-head">
                                <span>发票信息</span>
                            </div>
                            {this.state.loading ? <div style={{ position: 'absolute', width: '736px', height: '455px', zIndex: '10', cursor: 'progress' }}><div style={{ position: 'relative', width: '100%', height: '100%' }}><Loading /></div></div> : ''}
                            <table>
                                <tbody className='ant-table-tbody'>
                                    <tr className="ant-table-row">
                                        <td className='head'>
                                            <span className="title"><span className="needed">*</span>开户行</span>
                                        </td>
                                        <td className='column'>
                                            <input maxLength={50} placeholder='开户行'
                                                value={data.depositBank}
                                                onChange={(e) => this.recordModify.bind(this, e.target.value, 'depositBank')()}
                                                type="text" />

                                        </td>
                                        <td className='head'>
                                            <span className="title"><span className="needed">*</span>开户行账户</span>
                                        </td>
                                        <td className='column' >
                                            <input maxLength={30} placeholder='开户行账户'
                                                value={data.bankAccount}
                                                onChange={(e) => {
                                                    this.recordModify.bind(this, e.target.value.toNum(), 'bankAccount')();
                                                }}
                                                type='text' />

                                        </td>
                                    </tr>

                                    <tr className="ant-table-row">
                                        <td className='head'>
                                            <span className="title"><span className="needed">*</span>联系电话</span>
                                        </td>
                                        <td className='column' style={{ position: 'relative' }}>
                                            <input maxLength={20} placeholder="联系电话"
                                                value={data.contactPhone}
                                                onChange={(e) => {
                                                    this.recordModify.bind(this, e.target.value, 'contactPhone')();
                                                }}
                                                type="text" />
                                        </td>
                                        <td className='head'>
                                            <span className="title"><span className="needed">*</span>公司地址</span>

                                        </td>
                                        <td className='column' style={{ position: 'relative' }}>
                                            <input maxLength={50} placeholder="公司地址"
                                                value={data.companyAddress}
                                                onChange={(e) => {
                                                    this.recordModify.bind(this, e.target.value, 'companyAddress')();
                                                }}
                                                type="text" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
