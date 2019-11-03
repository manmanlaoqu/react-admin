import React from 'react'

export default class extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let { str, keyword } = this.props;
        str = str || '', keyword = keyword || '';
        let _str = str.toLocaleLowerCase(), _keyword = keyword.toLocaleLowerCase()
        let indexA = _str.indexOf(_keyword), indexB = indexA + keyword.length
        if(!keyword||!str||indexA<0){
            return str
        }
        let pre = str.substring(0, indexA)
        let mid = <span style={{ color: '#ff7800' }}>{str.substring(indexA, indexB)}</span>
        let end = str.substring(indexB, str.length)
        return (
            <span>{pre}{mid}{end}</span>
        )
    }
}