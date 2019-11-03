import React from 'react';
import './index.scss';

export default class InputFiler extends React.Component {

    state = {
    }
    clean() {
        this.setState({
            value:''
        })
    }
    onChange(e){
        this.setState({
            value:e.target.value,
        })
        this.props.onChange(e);
    }
    render() {
        const { text, placeholder } = this.props;
        return (
            <span style={this.props.style} className="list-filter" >
                {text?<span className="list-filter-text">{text}</span>:''}
                <input
                    className={"list-filter-inp "+ this.props.className}
                    type={'text'}
                    value={this.state.value}
                    onChange={this.onChange.bind(this)}
                    placeholder={placeholder}
                    onKeyDown={this.props.onKeyDown}
                />
            </span>
        );
    }

}