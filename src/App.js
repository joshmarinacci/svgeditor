import React, {Component} from 'react';
import './App.css';
import {VBox, HBox, Spacer} from "appy-comps";
import Point from "./Point";
import RSelection from "./RSelection";
import PropsSheet from "./PropsSheet"

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

    makeCircle() {
        return {
            type: 'circle',
            cx: '0',
            cy: '0',
            radius: '20',
            fill: 'red',
            hasChildren: () => false
        }
    }

    updateProperty(node, name, value) {
        node[name] = value;
        if (this.cb) this.cb(this);
    }

    addProperty(node, name, value) {
        node[name] = "" + (parseFloat(node[name]) + parseFloat(value));
        if (this.cb) this.cb(this);
    }

    getChildren() {
        return this.children;
    }

    addChild(node) {
        this.children.push(node);
        if (this.cb) this.cb(this);
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
            selection: selection,
            action:null
        };

        selection.add(rect);

        doc.onChange(() => this.setState({doc: doc}));

        selection.onChange(sel => this.setState({selection: sel}));

        this.insertNewRect = () => doc.addChild(doc.makeRect());

        this.insertNewCircle = () => doc.addChild(doc.makeCircle());

        this.clearSelection = () => this.state.selection.clear();
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
            <button onClick={this.insertNewRect}>new rect</button>
            <button onClick={this.insertNewCircle}>new circle</button>
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
        return <li key={key} className={clss}><span onClick={() => this.selectNode(node)}>{node.type}</span>{ch}</li>
    }

    renderMainView(doc) {
        const style = {
            border: '1px solid #888'
        };
        return <VBox grow style={style}>
            <svg version="1.1" baseProfile="tiny" width="400" height="400" xmlns="http://www.w3.org/2000/svg"
                 onMouseDown={this.clearSelection}
            >
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
                let xy = new Point(node.x, node.y);
                if(this.state.action && this.state.selection.contains(node)) {
                    xy = this.state.action.transform(node);
                }
                return <rect key={key}
                             x={xy.x}
                             y={xy.y}
                             width={node.width} height={node.height} fill={node.fill}
                             onMouseDown={(e) => this.nodePressed(e, node)}
                />
            }
            if (node.type === 'circle') {
                return <circle key={key}
                               cx={node.cx}
                               cy={node.cy}
                               r={node.radius}
                               fill={node.fill}
                />
            }
        }
    }

    nodePressed(e, node) {
        if (!this.state.selection.contains(node)) {
            if (e.shiftKey) {
                this.state.selection.add(node)
            } else {
                this.state.selection.replace(node);
            }
        }
        if (!this.state.selection.contains(node)) return;
        e.stopPropagation(); //don't let the background get this event
        this.setState({action:new DragAction(this,this.state.selection,e)});
    }
}

export default App;

class DragAction {
    constructor(app,selection,e) {
        this.selection = selection;
        this.startXY = new Point(e.screenX, e.screenY);
        this.diffXY = new Point(0,0);

        this.mouse_move_listener = (e) => {
            this.diffXY = new Point(e.screenX, e.screenY).minus(this.startXY);
            app.setState({diffXY:this.diffXY});
        };
        this.mouse_up_listener = (e) => {
            document.removeEventListener('mousemove', this.mouse_move_listener);
            document.removeEventListener('mouseup', this.mouse_up_listener);
            this.mouse_move_listener = null;
            this.mouse_up_listener = null;

            //update the nodes for real
            this.diffXY = new Point(e.screenX, e.screenY).minus(this.startXY);
            this.selection.addProperty('x', this.diffXY.x);
            this.selection.addProperty('y', this.diffXY.y);
            //remove this action from the app
            app.setState({action:null})
        };

        document.addEventListener('mousemove', this.mouse_move_listener);
        document.addEventListener('mouseup', this.mouse_up_listener);
    }

    //called to transform rendering nodes during the drag
    transform(node) {
        let xy = new Point(node.x, node.y);
        return xy.plus(this.diffXY);
    }
}
