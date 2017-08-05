import React, {Component} from 'react';
import './App.css';
import {VBox, HBox, Spacer} from "appy-comps";

class SVGDoc {
    constructor() {
        this.children = [];
        this.type = "doc"
        this.on = (cb) => {
            this.cb = cb;
        }
    }

    hasChildren() {
        return true;
    }

    makeRect() {
        return {
            type: 'rect',
            x: '0',
            y: '0',
            width: '50',
            height: '50',
            fill: 'blue',
            hasChildren: () => false
        }
    }

    updateProperty(node, name, value) {
        console.log('document updating',node,name,value);
        node[name] = value;
        if(this.cb) this.cb(this);
    }

    getChildren() {
        return this.children;
    }

    addChild(node) {
        this.children.push(node);
    }
}

class PropsSheet extends Component {
    updateProperty(name,value) {
        this.props.doc.updateProperty(this.props.selection,name,value);
    }
    render() {
        const obj = this.props.selection;
        const props = Object.keys(obj)
            .filter((name) => typeof obj[name] !== 'function')
            .map((name, i) => {
                return <HBox key={name}>
                    <label>{name}</label>
                    <input type="text" value={obj[name]} onChange={(e)=>this.updateProperty(name,e.target.value)}/>
                </HBox>
            });
        return <VBox grow className="propsheet">{props}</VBox>
    }
}

class App extends Component {

    constructor(props) {
        super(props);

        const doc = new SVGDoc();
        const rect = doc.makeRect();
        doc.addChild(rect);
        const rect2 = doc.makeRect();
        doc.updateProperty(rect2, 'x', 50);
        doc.updateProperty(rect2, 'y', 50);
        doc.updateProperty(rect2, 'fill', 'red');
        // rect2.x = 50;
        doc.addChild(rect2);
        doc.on(()=>{
            console.log("changed");
            this.setState({doc:doc})
        })

        this.state = {
            doc: doc,
            selectedSingleNode: rect
        }
    }

    render() {
        return <VBox fill>
            {this.renderToolbar()}
            <HBox grow>
                {this.renderTreeView(this.state.doc)}
                {this.renderMainView(this.state.doc)}
                {this.renderPropSheetView(this.state.doc)}
            </HBox>
            {this.renderStatusBar()}
        </VBox>
    }

    renderToolbar() {
        return <HBox className="statusbar">
            <button>new rect</button>
            <button>new circle</button>
            <button>delete selection</button>
        </HBox>
    }

    renderStatusBar() {
        return <HBox className="statusbar">
            <button>left</button>
            <Spacer/>
            <label>status bar</label>
            <Spacer/>
            <button>right</button>
        </HBox>

    }

    renderTreeView(node) {
        const style = {
            minWidth: '200px',
        };
        return <VBox style={style} className="tree">
            <ul>{this.renderTreeNode(node, 'doc')}</ul>
        </VBox>
    }

    renderTreeNode(node, key) {
        let ch = '';
        if (node.hasChildren()) {
            ch = <ul>{node.getChildren().map((ch, i) => this.renderTreeNode(ch, i))}</ul>
        }
        let clss = "";
        if (this.state.selectedSingleNode === node) {
            clss = 'selected-tree-node';
        }
        return <li key={key} className={clss}><span>{node.type}</span>{ch}</li>
    }

    renderMainView(doc) {
        const style = {
            border: '1px solid red'
        };
        return <VBox grow style={style}>
            <svg version="1.1" baseProfile="tiny" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                {this.renderSVGChildren(doc)};
            </svg>
        </VBox>
    }

    renderPropSheetView() {
        return <VBox>
            <PropsSheet selection={this.state.selectedSingleNode} doc={this.state.doc}/>
        </VBox>
    }

    renderSVGChildren(node, key) {
        if (node.hasChildren()) {
            return node.getChildren().map((ch, i) => {
                return this.renderSVGChildren(ch, i);
            })
        } else {
            if (node.type === 'rect') {
                return <rect key={key}
                             x={node.x}
                             y={node.y}
                             width={node.width} height={node.height} fill={node.fill}/>
            }
        }
    }
}

export default App;
