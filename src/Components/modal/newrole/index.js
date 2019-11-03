import React from 'react';

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state={
            roleName:this.props.role?this.props.role.roleName:'',
            remark:this.props.role?this.props.role.remark:'',
        }
    }

    input(val, key) {
        this.state[key] = val;
        this.setState({
            ...this.state
        }, function () {
            this.props.notifyChange(this.state)
        })
    }

    onChange(roleId) {
        this.setState({
            ...this.state,
            roleId: roleId
        }, function () {
            this.props.notifyChange(this.state)
        })
    }


    render() {
        return (
            <div>
                <div className="mod-form">
                    <div className="mod-form-title">角色信息</div>
                    <div className="mod-form-item">
                        <span className="mod-form-head"><span className="needed">*</span>角色名</span>
                        <div className="mod-form-inp">
                            <input maxLength={10} placeholder="角色名" value={this.state.roleName} onChange={(e) => this.input.bind(this, e.target.value, 'roleName')()} type="text" />
                        </div>
                    </div>
                    <div className="mod-form-item">
                        <span className="mod-form-head"><span className="needed">*</span>描述</span>
                        <div className="mod-form-inp">
                            <input maxLength={200} placeholder='请对角色进行描述' value={this.state.remark} onChange={(e) => this.input.bind(this, e.target.value, 'remark')()} type="text" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}