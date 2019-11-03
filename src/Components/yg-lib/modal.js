import React from 'react';
import Button from '../lib/button';

export default class ModalFoot extends React.Component {

    render() {
        const { content, okText, cancelText, okLoading, onCancel, onOk } = this.props.opts;
        return (
            <div>
                <div>
                    {content}
                </div>
                <div>
                    <Button onClick={onCancel}>{cancelText}</Button>
                    <Button onClick={onOk} loading={okLoading}>{okText}</Button>
                </div>
            </div>
        );
    }

}

InputFiler.propTypes = {
    onPressEnter: PropTypes.func,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    type: PropTypes.string
};