import React from 'react';
import Layout from 'antd/lib/layout';
import Content from  'antd/lib/layout';

class NotFound extends React.Component {
  constructor(props){
  	super(props);

  }

  render() {
    return (
    <Layout>
      <Content>404</Content>
    </Layout>
    );


  }

}


export default NotFound;

