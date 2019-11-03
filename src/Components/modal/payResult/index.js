import Utils from 'utils/utils';
import React from 'react';

export default class PayResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            payResult: this.props.payResult
        }
    }

    render() {
        const { payResult } = this.state;
        return (
            <div className="batch-table" style={{ textAlign: 'center' }} id={this.id}>
                <div style={{ padding: '12px 6px' }}>
                    支付金额：<span style={{ color: '#ff7800', fontWeight: 'bold', fontSize: '20px', marginRight: '6px' }}>{payResult.totalAmount}</span>元
                </div>
                {Utils.amountVerify(payResult.cashAmount) ?
                    <div className="result-item">
                        现金：{payResult.cashFailed ?
                            <span style={{ color: '#fc2c2c' }}>支付失败 {payResult.cashMsg?('：'+payResult.cashMsg):''}</span> : <span>支付成功</span>}
                    </div>
                    :
                    null}
                {Utils.amountVerify(payResult.oilAmount) ?
                    <div className="result-item">
                        油卡：{payResult.oilFailed ?
                            <span style={{ color: '#fc2c2c' }}>支付失败{payResult.oilMsg?('：'+payResult.oilMsg):''}</span> : <span>支付成功</span>}
                    </div>
                    :
                    null}
                {Utils.amountVerify(payResult.taxAmount) ?
                    <div className="result-item">
                        服务费：{payResult.taxFailed ?
                            <span style={{ color: '#fc2c2c' }}>支付失败{payResult.taxMsg?('：'+payResult.taxMsg):''}</span> : <span>支付成功</span>}
                    </div>
                    :
                    null}
            </div>
        )
    }
}