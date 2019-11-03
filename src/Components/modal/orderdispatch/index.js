import React from 'react';
import Listchose from '../listchose';
import Button from '../../lib/button';
import VehicleColor from '../../yg-lib/vehicleColor'
import { Tabs } from 'antd';

const TabPane = Tabs.TabPane;

export default class extends React.Component {

    render() {
        if (this.props.only) {
            return this.props.defaultActiveKey == 0 ? <Listchose
                current={this.props.driver}
                api={this.props.driverApi}
                placeholder="姓名/手机号"
                empty={this.props.driverEmpty}
                test={(item1, item2) => {
                    return (item1.phone||item1.driverPhone) == item2.phone
                }}
                template={
                    (driver) => {
                        return (
                            <div>
                                <div className="left" >
                                    <span style={{ marginRight: '6px' }}>{driver.name}</span>
                                    <span>{driver.phone}</span>
                                </div>
                                {driver.driverAuthStatus != 1 ?
                                    <div className="right" >未认证</div> : (driver.locAuthStatus != 1 ? <div className="right" >未授权</div> : null)}
                            </div>
                        )
                    }
                }
                onSelected={this.props.onDriverSelected}
                emptyTemplate={<Button text="添加司机" className="common" onClick={() => {
                    //todo 跳转司机添加
                    this.props.addDriver()
                }} />}
            /> : <Listchose
                    current={this.props.vehicle}
                    api={this.props.vehicleApi}
                    placeholder="车牌号"
                    empty={this.props.vehicleEmpty}
                    test={(item1, item2) => {
                        return item1.vehicleNo == item2.vehicleNo && item1.vehiclePlateColor == item2.vehiclePlateColor
                    }}
                    template={
                        (vehicle) => {
                            return (
                                <div>
                                    <span style={{ marginRight: '6px' }}>
                                        <span>{vehicle.vehicleNo}</span>
                                        <VehicleColor color={vehicle.vehiclePlateColor.replace('色', '')} />
                                    </span>
                                    <span className="info">{vehicle.vehicleTypeName}</span>
                                </div>
                            )
                        }
                    }
                    onSelected={this.props.onVehicleSelected}
                    emptyTemplate={<Button text="添加车辆" className="common" onClick={() => {
                        //todo 跳转车辆添加
                        this.props.addVehicle()
                    }} />}
                />
        }
        return (
            <div>
                <Tabs defaultActiveKey={this.props.defaultActiveKey.toString() || "0"}>
                    <TabPane tab="指定承运司机" key="0">
                        <Listchose
                            current={this.props.driver}
                            api={this.props.driverApi}
                            placeholder="姓名/手机号"
                            empty={this.props.driverEmpty}
                            test={(item1, item2) => {
                                return item1.driverPhone == item2.driverPhone
                            }}
                            template={
                                (driver) => {
                                    return (
                                        <div>
                                            <div className="left" >
                                                <span style={{ marginRight: '6px' }}>{driver.driverName}</span>
                                                <span>{driver.driverPhone}</span>
                                            </div>
                                            {driver.driverAuthStatus != 1 ?
                                                <div className="right" >未认证</div> : (driver.locAuthStatus != 1 ? <div className="right" >未授权</div> : null)}
                                        </div>
                                    )
                                }
                            }
                            onSelected={this.props.onDriverSelected}
                            emptyTemplate={<Button text="添加司机" className="common" onClick={() => {
                                this.props.addDriver()
                            }} />}
                        />
                    </TabPane>
                    <TabPane tab="指定承运车辆" key="1">
                        <Listchose
                            current={this.props.vehicle}
                            api={this.props.vehicleApi}
                            placeholder="车牌号"
                            empty={this.props.vehicleEmpty}
                            test={(item1, item2) => {
                                return item1.vehicleNo == item2.vehicleNo && item1.vehiclePlateColor == item2.vehiclePlateColor
                            }}
                            template={
                                (vehicle) => {
                                    return (
                                        <div>
                                            <span style={{ marginRight: '6px' }}>
                                                <span>{vehicle.vehicleNo}</span>
                                                <VehicleColor color={vehicle.vehiclePlateColor.replace('色', '')} />
                                            </span>
                                            <span className="info">{vehicle.vehicleTypeName}</span>
                                        </div>
                                    )
                                }
                            }
                            onSelected={this.props.onVehicleSelected}
                            emptyTemplate={<Button text="添加车辆" className="common" onClick={() => {
                                this.props.addVehicle()
                            }} />}
                        />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

