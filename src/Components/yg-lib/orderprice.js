import React from 'react'
import PropTypes from 'prop-types'

export default class OrderPriceColumn extends React.Component {

    getPayStatus(status) {
        //0未支付，1已支付，2支付中，3部分付款，4已提交',
        switch (status) {
            case 0:
                return <span style={{ color: '#ff7800', fontSize: '12px' }}>待支付</span>
            case 1:
                return <span style={{ color: '#66c386', fontSize: '12px' }}>已支付</span>
            case 2:
                return <span style={{ color: '#ff7800', fontSize: '12px' }}>处理中</span>
            case 3:
                return <span style={{ color: '#FBC505', fontSize: '12px' }}>部分付款</span>
            case 4:
                return <span style={{ color: '#83B4F3', fontSize: '12px' }}>已提交</span>
            default:
                return null;
        }
    }

    render() {
        const price = this.props.price||{}
        return (
            <div>
                <span style={{ display: 'inline-block', }}>{price.amountName}</span>
                {price.prepayCash == '0.00' ? '' : <span style={{ float: 'right' }}>{this.getPayStatus(price.paymentStatus)}</span>}
            </div>
        )
    }
}

OrderPriceColumn.propTypes = {
    price: PropTypes.object
}