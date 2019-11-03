import React from 'react';
import FreshComponent from '../freshbind';
import Reload from '../reload'

class CompanyInfo extends FreshComponent{
    constructor(props){
        super(props)
    }
    render(){
        return <div>
                    <div></div>
             </div>
    }
}

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            
        };
    }
    
    render() {
        return <Reload {...this.props} component={CompanyInfo} />
    }
  
}
