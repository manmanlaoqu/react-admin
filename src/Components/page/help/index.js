
import React from 'react';
import { Link } from 'react-router'
import './index.scss'

export default class extends React.Component {

    constructor(props) {
        super(props);
        this.urls = {
            new: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/new.mp4',
            assign: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/assign.mp4',
            contract: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/contract.mp4',
            pay: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/pay.mp4',
            exception: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/exception.mp4',
            invoice: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/invoice.mp4',
            user: 'http://utrailer-1.oss-cn-hangzhou.aliyuncs.com/kc-web/video/user.mp4',
        };
        const { path } = this.props.match.params
        if (!path || !this.urls[path]) {
            this.state = {
                index: 'new',
                url: this.urls['new']
            }
        } else {
            this.state = {
                index: path,
                url: this.urls[path]
            }
        }
    }




    render() {
        const index = this.state.index;
        return (
            <div className="help-page">
                <div className="head">优挂企业版《使用帮助》视频教程</div>
                <div className="content">
                    <div className="left">
                        <ul className="list">
                            <li className={index == 'new' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['new'],
                                        index: 'new'
                                    })
                                    this.props.history.push('./new')
                                }}>一、创建订单</li>
                            <li className={index == 'assign' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['assign'],
                                        index: 'assign'
                                    })
                                    this.props.history.push('./assign')
                                }}>二、添加车辆</li>
                            <li className={index == 'contract' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['contract'],
                                        index: 'contract'
                                    })
                                    this.props.history.push('./contract')
                                }}>三、上传合同</li>
                            <li className={index == 'pay' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['pay'],
                                        index: 'pay'
                                    })
                                    this.props.history.push('./pay')
                                }}>四、运费支付</li>
                            <li className={index == 'exception' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['exception'],
                                        index: 'exception'
                                    })
                                    this.props.history.push('./exception')
                                }}>五、订单申诉</li>
                            <li className={index == 'invoice' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['invoice'],
                                        index: 'invoice'
                                    })
                                    this.props.history.push('./invoice')
                                }}>六、申请开票</li>
                            <li className={index == 'user' ? 'curr' : ''}
                                onClick={() => {
                                    this.setState({
                                        url: this.urls['user'],
                                        index: 'user'
                                    });
                                    this.props.history.push('./user')
                                }}>七、新增员工</li>
                        </ul>
                    </div>
                    <div className="right">
                        <div className="video">
                            <video src={this.state.url} controls="controls">
                                请使用IE11以上浏览器或者谷歌浏览量、火狐浏览器、Safari浏览器
                        </video>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}