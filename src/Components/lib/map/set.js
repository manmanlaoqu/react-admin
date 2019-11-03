import React from 'react';
import { Map, Marker } from 'react-amap';
import CONSTANT from '../../../lib/constant'

export default class extends React.Component {
    constructor(props) {
        super(props);
        // Good Practice
        let that = this;
        this.state = {
            markers: this.props.markers,
            center: this.props.center || this.props.markers[0].pos
        }
    }

    render() {

        return <div style={{ width: 800, height: 400 }}>
            <Map center={this.state.center} zoom={12} events={
                {
                    created(map) {
                        map.setMapStyle('amap://styles/' + CONSTANT.mapStyle)
                    },
                }
            } amapkey={CONSTANT.amapkey}>
                {this.state.markers.map((item) => {
                    return <Marker title={item.label} position={item.pos} />
                })}
            </Map>
        </div>
    }
}