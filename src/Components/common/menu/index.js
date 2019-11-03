import React from 'react';
import { Menu, Icon, Layout, Tooltip } from 'antd';
import Events from 'gc-event/es5'
import ScrollBar from 'smooth-scrollbar';
import Logo from '../logo'
import './index.scss';

const { Sider } = Layout;

const { SubMenu } = Menu;


class MenuIcon extends React.Component {
    render() {
        return (
            <i className={"iconfont " + this.props.name} style={{ marginRight: '24px', float: 'left' }}></i>
        )
    }
}

const iconMap = {
    '团队管理': 'icon-tuanduiguanli',
    '企业钱包': 'icon-settlement',
    '设置': 'icon-shezhi',
    '车辆管理': 'icon-qiachetou',
    '运力管理': 'icon-qiachetou',
    '司机管理': 'icon-siji-',
    '订单管理': 'icon-dingdanguanli',
    '创建订单': 'icon-xinjian',
    '新建订单': 'icon-xinjian',
    '发票管理': 'icon-fapiao',
    '首页': 'icon-index',
    '审核管理': 'icon-shenpi',
    '运费支付': 'icon-yunfeizhifu',
    '收款人管理': 'icon-70',
    "油卡管理": 'icon-jiayouqia'
};

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            open: false,
            width: 180,
        }
        let that = this;
        this.state.menu = this.props.menu.map((item, i) => {
            if (!item.subModuleList || item.type === 'Function') {
                if (item.sort <= 0) {
                    return null;
                }
                return (
                    <Menu.Item
                        className="activeable"
                        onClick={() => that.itemClick({ module: item.moduleName, moduleText: item.moduleName })}
                        key={i}>
                        <MenuIcon name={iconMap[item.moduleName]} />
                        {item.moduleName}
                    </Menu.Item>
                )
            } else {
                return (
                    <SubMenu key={'sub' + i}
                        title={<span><MenuIcon name={iconMap[item.moduleName]} /> <span className="side-menu-title">{item.moduleName}</span></span>}>
                        {item.subModuleList.map((sm, j) => {
                            return (
                                <Menu.Item onClick={(e) => that.itemClick({ module: sm.moduleName, moduleText: sm.moduleName })}
                                    className="activeable"
                                    key={i + '' + j}
                                >
                                    <span style={{ marginLeft: '16px' }}>{sm.moduleName}</span>
                                </Menu.Item>
                            )
                        })}
                    </SubMenu>
                )
            }
        })



        this.state.menu.unshift(
            <Menu.Item
                className="activeable"
                onClick={() => that.itemClick({ module: '首页', moduleText: '首页' })}
                key={-1}>
                <MenuIcon name={iconMap['首页']} />
                首页
            </Menu.Item>
        )
    }
    itemClick(obj) {
        this.props.onMenuClick({
            moduleText: obj.moduleText,
            module: obj.module,
        });
    }

    componentWillMount() {
        let that = this;
        Events.on('toggleMenu', function (call) {
            that.toggleCollapsed(call);
        });
        Events.on('fullScreen', function (call) {
            that.setState({
                width: that.state.width > 0 ? 0 : 180,
                full:that.state.width > 0?false:true,
                collapsed: false
            });
        });
    }

    componentDidMount() {
        let that = this;
        ScrollBar.init(document.getElementById('menu-container'))
        let resizeFn = this.throttle (this.autoCollapsed.bind(this),100)
        window.onresize = function () {
            if(that.state.full){
                return
            }
            resizeFn()
        }
    }

    throttle(fn,interval) {
        let timer,now = Date.now(),firstExe = false;
        return function() {
            var args = arguments,_this = this
            let _now = Date.now()//execute time
            if(!firstExe){
                fn.apply(_this,args);
                now = _now
                firstExe = true
            }else{
                if(interval-_now+now>=0){
                    clearTimeout(timer)
                }
                timer = setTimeout(function(){
                    now = Date.now()
                    fn.apply(_this,args);
                },interval-_now+now)
            }
        }
    }

    autoCollapsed() {
        if (window.innerWidth > 1280 && this.state.open) {
            this.setState({
                collapsed: false,
                open: false
            })
            return
        }
        if (window.innerWidth <= 1280 && !this.state.open) {
            this.setState({
                collapsed: true,
                open: true
            })
            return
        }
    }

    toggleCollapsed = (call) => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
        if (call) {
            call(!this.state.collapsed)
        }
    }


    render() {
        return (
            <Sider
                // collapsible
                width={this.state.width}
                collapsed={this.state.collapsed}
            >
                <Logo />
                <Menu
                    mode="inline"
                    mode="inline"
                    theme="dark"
                    id="menu-container"
                    collapsed={this.state.collapsed}
                    style={{ height: 'calc(100vh - 126px)', borderRight: 0 }}
                >
                    {this.state.menu}
                </Menu>
                {/* {this.state.collapsed ? <Tooltip placement="right" title={'使用帮助'}>
                    <div className="helpbox">
                        <div className="help" onClick={() => { window.open('/#/help') }}>
                            <span className="text">使用帮助</span>
                            <Icon theme="filled" type="question-circle" />
                        </div>
                    </div>
                </Tooltip> :
                    <div className="helpbox">
                        <div className="help" onClick={() => { window.open('/#/help') }}>
                            <span className="text">使用帮助</span>
                            <Icon theme="filled" type="question-circle" />
                        </div>
                    </div>
                } */}
            </Sider>
        )
    }
}