import React, {Component} from 'react';
import './App.css';
import {VBox, HBox, Spacer} from "appy-comps";

class RSelection {
    constructor(doc) {
        this.doc = doc;
        this.nodes = [];
        this.cbs = [];
    }
    fireChange() {
        this.cbs.forEach((cb)=>cb(this));
    }

    onChange(cb) {
        this.cbs.push(cb);
    }
    isNotEmpty() {
        return this.nodes.length > 0;
    }
    add(node) {
        this.nodes.push(node);
        this.fireChange();
    }
    replace(node) {
        this.nodes = [node];
        this.fireChange();
    }
    clear() {
        this.nodes = [];
        this.fireChange();
    }
    contains(node) {
        return this.nodes.indexOf(node) >= 0;
    }
    updateProperty(name,value) {
        this.nodes.forEach((node,i)=>{
            this.doc.updateProperty(node,name,value);
        });
    }
    getKeys() {
        let keys = {};
        this.nodes.forEach((node)=>{
            Object.keys(node).forEach((key)=>{
                var val = node[key];
                if(typeof val === 'function') return;
                if(key === 'type') return;
                keys[key] = val;
            });
        });
        return Object.keys(keys);
    }

    getValue(key) {
        if(this.isNotEmpty()) return this.nodes[0][key];
        return "";
    }

}
class SVGDoc {
    constructor() {
        this.children = [];
        this.type = "doc"
        this.onChange = (cb) => {
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
        this.props.selection.updateProperty(name,value);
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

class App extends Component {

    constructor(props) {
        super(props);

        const doc = new SVGDoc();
        const selection = new RSelection(doc);
        const rect = doc.makeRect();
        doc.addChild(rect);
        const rect2 = doc.makeRect();
        doc.updateProperty(rect2, 'x', 50);
        doc.updateProperty(rect2, 'y', 50);
        doc.updateProperty(rect2, 'fill', 'red');
        doc.addChild(rect2);


        this.state = {
            doc: doc,
            selection:selection
        };

        selection.add(rect);

        doc.onChange(()=>this.setState({doc:doc}));
        selection.onChange((sel)=>{this.setState({selection:sel})})
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

    selectNode(node) {
        this.state.selection.replace(node);
    }

    renderTreeNode(node, key) {
        let ch = '';
        if (node.hasChildren()) {
            ch = <ul>{node.getChildren().map((ch, i) => this.renderTreeNode(ch, i))}</ul>
        }
        let clss = "";
        if (this.state.selection.contains(node)) {
            clss = 'selected-tree-node';
        }
        return <li key={key} className={clss}><span onClick={()=>this.selectNode(node)}>{node.type}</span>{ch}</li>
    }

    renderMainView(doc) {
        const style = {
            border: '1px solid #888'
        };
        return <VBox grow style={style}>
            <svg version="1.1" baseProfile="tiny" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                {this.renderSVGChildren(doc)};
            </svg>
        </VBox>
    }

    renderPropSheetView() {
        return <VBox>
            <PropsSheet selection={this.state.selection} doc={this.state.doc}/>
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
                             width={node.width} height={node.height} fill={node.fill}
                             onClick={()=>this.nodeClicked(node)}
                />
            }
        }
    }

    nodeClicked(e) {
        this.state.selection.replace(e);
    }
}

export default App;
