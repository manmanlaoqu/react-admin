import React from 'react'
import Page from '../Components/AsyncBundles'

export default class extends React.Component {
    constructor(props) {
        super(props);
        let a = this.props.location.pathname.split('/')
        this.options = a.slice(2,a.length)
        a = a[1]
        if (!a) {
            this.page = Page.Nopage
        } else {
            let x = a[0].toLocaleUpperCase()
            a = x + a.substring(1, a.length)
            this.page = Page[a]
            if(!this.page){
                this.page = Page.Nopage
            }
        }
    }
    render() {
        return <this.page options={this.options}/>
    }
}