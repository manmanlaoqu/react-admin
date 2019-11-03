import React from 'react'

export default class extends React.Component{

    state={
        minPrice:'',
        maxPrice:''
    }

    clean(){
        this.setState({
            minPrice: '',
            maxPrice: ''
        })
    }

    render() {
        return (
            <span className="list-filter range">
                <span className="list-filter-text">金额区间</span>
                <div className="range-picker-box">
                    <input value={this.state.minPrice}
                        onChange={(e) => {
                            let val = e.target.value.toNum()
                            this.setState({
                                minPrice: val
                            }, function () {
                                this.props.onMin(val ? val * 100 : '')
                            })

                        }}
                        className='filter-price' placeholder='最小金额'></input>元
                            <i style={{ color: '#333333', marginLeft: '10px', display: 'inline-block' }} className="iconfont icon-jiantou"></i>
                    <input
                        value={this.state.maxPrice}
                        onChange={(e) => {
                            let val = e.target.value.toNum()
                            this.setState({
                                maxPrice: val
                            },function(){
                                this.props.onMax(val ? val * 100 : '')
                            })
                        }}
                        className='filter-price' placeholder='最大金额'></input>元
                    </div>
            </span>
        )
    }

}