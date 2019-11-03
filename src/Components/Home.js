import React from 'react';
import Card from 'antd/lib/card';
import Layout from 'antd/lib/layout';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';

import { LayoutRightTop } from './AsyncBundles'
//custome
import Button from 'lib/button';
import PopoverSearchable from 'lib/popover/searchable';
import PopoverSingleSearchable from 'lib/popover/singleSelector';
import PopoverMultipleSearchable from 'lib/popover/multipleSelector';
import PopRange from 'lib/popover/poprange';
import Icon from 'lib/icons';

// import { content } from './js/style.js'
//redux
import { connect } from "react-redux";
//actions
import { modalConstants, makeActionCreator } from 'actions/ActionTypes';

import Highlight from './lib/highlight';
//icons
import { Svgs } from './lib/icons/svg/index';

const dataText = '[{"text":"Darrft"}, {"text":"On Confirmation"}, {"text":"Confirmed"},{"text":"On Production"},{"text":"Produced"},{"text":"Be Coordinated Be Coordinated Be Coordinated"},{"text":"On Production"},{"text":"Produced"}]'
const dataTextAvatar = '[{"text":"Darrft","src":"http://hzdev.offerplus.com:82//assets/government/img/Avatar_Manufacturers.png"}, {"text":"On Confirmation","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_2.png"}, {"text":"Confirmed","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_1.png"},{"text":"On Production","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_3.png"},{"text":"Produced","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_4.png"},{"text":"Be Coordinated Be Coordinated Be Coordinated","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_1.png"},{"text":"On Production","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_2.png"},{"text":"Produced","src":"http://hzdev.offerplus.com:82/assets/government/img/ourteam_3.png"}]'

const singSelectPopoverData=[{"accessAuth":3,"accountStatus":0,"createTime":1527663468000,"headImg":"FiU6x2Uby4A5t-PYyQ-1Qylj6iWg","productTotal":2,"userId":1000671,"userName":"ghost lala"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000678,"userName":"我是小明e"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000741,"userName":"测48"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000742,"userName":"测49"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000743,"userName":"测50"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000744,"userName":"测51"},{"accessAuth":2,"accountStatus":0,"createTime":1527404268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","position":"ADC","productTotal":6,"userId":1000745,"userName":"nick young"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000746,"userName":"测53"},{"accessAuth":2,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000747,"userName":"测54"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000748,"userName":"测55"},{"accessAuth":1,"accountStatus":0,"createTime":1526972268000,"headImg":"03bbcff1-f0c8-4b3d-8ddd-c5779a79cd4c","productTotal":0,"userId":1000749,"userName":"测56"},{"accessAuth":1,"accountStatus":0,"createTime":1531553616000,"position":"fdwegfre","productTotal":0,"userId":1050853,"userName":" cd v fdz"}];

const content = {}

class TempDom extends  React.Component{

  render(){
    const style = this.props.hide?{display:'none'}:{};
    return (
      <span row={this.props.data} style={style}>
          <Highlight hstr={this.props.data.hstr} text={this.props.data.userName} />
    <img style={{width:'32px',float:'right'}} src={this.props.data.headImg?'http://imagedev.offerplus.com/'+this.props.data.headImg:''}/>
    </span>
    )
  }
}


class Home extends React.Component {

  constructor(props){
    super(props);
  }

  eventClick() {
    
  }

  onSortEvent = (e) => {
    
  }

  onItemEvent = (e) => {
    
  }



  render() {
    const { pathname } = this.props.location?this.props.location:{};
    const { Content} = Layout;
    const { modalVisible, modalId, dispatch, subTitle, modalTitle, searchHasVal, searchVal } = this.props;

    const iconArrays = Object.keys(Svgs);
    const icons = iconArrays.filter( (val) =>{
      return val
    }).map( (val) => {

      return  (
          <Col key={val} span={4} style={{margin:'20px 0'}}>
            <Icon type={val} size={24} />
            <p>{val}</p>
          </Col>
        )
    })

    return (
  <Layout>
  <LayoutRightTop pathname={ this.props.pathname } user={this.props.user}/>
  {
  searchHasVal
  ?
  ''
  :
  (<Content style={content}>

    <div style={{height:"2000px"}}>

        <Row>
        <Col span={24}>
            <Card title="Icons" bordered={false} style={{textAlign:'center'}}>
              <Row gutter={16} >
                {icons}
              </Row>
              <Row gutter={16} >
                <Col span={12}>
                  <Icon type="logo" width={600}/>
                </Col>
                <Col span={12}>
                  <Icon type="logo-colored" width={600}/>
                </Col>                
              </Row>
            </Card>
        </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Card title="Button" bordered={false} style={{textAlign:'center'}}>
            <p>
              <Button
              customeStyle="large" text="PAY"
              />
            </p>
            <p>
              <Button customeStyle="medium" text="BUY MORE" />
            </p>
            <p>
              <Button text="OK" />
            </p>
            <p>
              <Button text="OK" disabled />
            </p>
            <p>
              <Button text="TAG" customeStyle="btn-text-icon" icon="down" />
            </p>
            <p>
              <Button text="TAG" customeStyle="btn-text-icon" blueColor/>
            </p>
            </Card>
          </Col>
        </Row>



       <Row gutter={16}>
          <Col span={8} style={{textAlign:'center'}}>
            <Card title="PopoverSearchable" bordered={false}>
            <div style={{height:"490px"}}>
              <PopoverSearchable
                buttonText="Tag"
                iconType="down"
                visible={true}
                title="TAG FIELD"
                maxHeight={300}
                data={dataText}
                  />
              </div>

             <div style={{height:"490px"}}>
              <PopoverSearchable
                buttonText="Contact"
                iconType="down"
                visible={true}
                title="CONTACT FIELD"
                maxHeight={300}
                data={dataTextAvatar}
                  />
              </div>

            <div style={{height:"490px"}}>
              <PopoverSearchable
                buttonText="Unit"
                iconType="down"
                visible={true}
                title="UNIT FIELD"
                maxHeight={300}
                data={dataText}
                noSearchable
                />
            </div>
            </Card>
          </Col>

          <Col span={8} style={{textAlign:'center'}}>
            <Card title="PopoverDragable" bordered={false}>
            <div style={{height:"490px"}}>
              {/*<PopoverDragable*/}
                {/*iconType="bars"*/}
                {/*buttonText="Drag"*/}
                {/*visible={true}*/}
                {/*title="SETTING DISPLAY FIELD"*/}
                {/*maxHeight={300}*/}
              {/*/>*/}
            </div>
            </Card>

          </Col>
          
          
          <Col span={8} style={{textAlign:'center'}}>
            <Card title="PopoverSingleSearchable" bordered={false}>
            <div style={{height:"490px"}}>
            <PopoverSingleSearchable
                buttonText="Unit"
                iconType="down"
                visible={true}
                noSearchable={true}
                title="UNIT FIELD"
                maxHeight={300}
                filtKey="userName"
                component={TempDom}
                data={singSelectPopoverData}
                onItemEvent={(row,i)=>{console.log(row)}}
                />
            </div>
            </Card>

          </Col>

           <Col span={8} style={{textAlign:'center'}}>
            <Card title="PopoverMultipleSearchable" bordered={false}>
            <div style={{height:"490px"}}>
            <PopoverMultipleSearchable
                buttonText="Unit"
                iconType="down"
                visible={true}
                noSearchable={false}
                title="UNIT FIELD"
                maxHeight={300}
                filtKey="userName"
                component={TempDom}
                data={singSelectPopoverData}
                onOk={(list) => console.log(list)}
                />
            </div>
            </Card>

          </Col>
          
          <Col span={8} style={{textAlign:'center'}}>
            <Card title="PopoverMultipleSearchable" bordered={false}>
            <div style={{height:"490px"}}>
              <PopRange buttonText="range picker"/>
            </div>
            </Card>

          </Col>


       </Row>
       
      </div>


      </Content>)
      }

      </Layout>
    );
  }

}

export default Home;


