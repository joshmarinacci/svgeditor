import React, {Component} from "react";
import {HBox, VBox} from "appy-comps";

export default class PropsSheet extends Component {
    updateProperty(name, value) {
        this.props.selection.updateProperty(name, value);
    }

    render() {
        const props = this.props.selection.getKeys().map((key, i) => {
            const val = this.props.selection.getValue(key);
            return <HBox key={key}>
                <label>{key}</label>
                <input type="text" value={val} onChange={(e) => this.updateProperty(key, e.target.value)}/>
            </HBox>
        });
        return <VBox grow className="propsheet">{props}</VBox>
    }
}
