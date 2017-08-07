export default class RSelection {
    constructor(doc) {
        this.doc = doc;
        this.nodes = [];
        this.cbs = [];
    }

    fireChange() {
        this.cbs.forEach((cb) => cb(this));
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

    updateProperty(name, value) {
        this.nodes.forEach((node, i) => {
            this.doc.updateProperty(node, name, value);
        });
    }
    addProperty(name, value) {
        this.nodes.forEach((node) => this.doc.addProperty(node, name, value))
    }

    getKeys() {
        let keys = {};
        this.nodes.forEach((node) => {
            Object.keys(node).forEach((key) => {
                var val = node[key];
                if (typeof val === 'function') return;
                if (key === 'type') return;
                keys[key] = val;
            });
        });
        return Object.keys(keys);
    }

    getValue(key) {
        if (this.isNotEmpty()) return this.nodes[0][key];
        return "";
    }

}
