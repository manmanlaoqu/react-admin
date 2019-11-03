import React from 'react';
import { Avatar, Row,Col } from 'antd';

export default class extends React.Component {
    render() {
        return (
            <Row>
                <Col>
                    <Avatar size="large" icon="user" />
                </Col>
                <Col>
                    <div className="yg-color" style={{display:'inline-block'}}>您好，张三</div>
                    <div style={{display:'inline-block'}}>个人中心，退出</div>
                </Col>
            </Row>
        )
    }
}