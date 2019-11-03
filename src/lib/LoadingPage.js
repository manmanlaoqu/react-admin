import React from 'react';
export default  class LoadingPage extends React.Component{
    state={
        loading:false,
        modalLoading:false,
    }
    loading(){
        this.setState({
            loading:!this.state.loading
        })
    }
    modalLoading(){
        this.setState({
            modalLoading:!this.state.modalLoading
        }) 
    }
}