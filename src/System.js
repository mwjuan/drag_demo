import React, { Component } from 'react';
import { Select, Button, Modal, Descriptions, Empty } from 'antd';
import axios from 'axios';
import nanoid from 'nanoid';
import _ from 'lodash';
let svgNS = 'http://www.w3.org/2000/svg';
const e = React.createElement;

function System(props) {
    return (
        <div style={{ background: '#F5F7F8', height: '100%', position: 'relative' }}>
            <svg
                draggable={true}
                id="__map"
                ref={props.svgRef}
                cursor='pointer'
                width="100%"
                height="100%"
                // viewBox="-200 0 2400 1100"
                preserveAspectRatio="xMinYMin meet"
                style={{ borderLeft: '1px solid #ddd' }}>
                <g>
                    {props.reactSVGElement}
                </g>
            </svg>
        </div>
    );
}

let hoc = (WrappedComponent) => {
    return class EnhancedComponent extends Component {
        constructor(props) {
            super(props);
            this.svgRef = React.createRef();
            this.patterns = {
                device: /^[a-z0-9-]+[:]+[a-zA-Z0-9]+([:]+[0-9]+)*$/
            };
            this.styles = {
                deviceOnline: { fill: '#1AB056' },
                deviceDeonline: { fill: '#E02208' }
            };

            this.state = {
                scale: 1.0,
                offsetX: 0,
                offsetY: 0,
                rotate: 0,
                systemDiagrams: []
            };

            this.mapCache = null;
        }

        async componentDidMount() {
            await this.load('http://localhost:3000/system.svg');

            this.timer = setInterval(() => {
                this.forceUpdate();
            }, 1000);
        }

        async load(src) {
            if (!src) {
                this.mapCache = null;
                return;
            }
            if (!this.mapCache) {
                let response = await axios.get(src);

                var parser = new DOMParser();
                let xmlDoc = parser.parseFromString(response.data, 'text/xml');

                let doc = xmlDoc.documentElement;
                if (doc.tagName === 'html') {
                    return;
                }

                let root = document.createElementNS(svgNS, 'g');
                root.setAttribute('id', 'root');

                for (let each of doc.children) {
                    if (['title', 'desc'].includes(each.tagName)) continue;
                    root.appendChild(each);
                }

                this.walk(root);

                this.mapCache = {
                    svg: doc,
                    root
                };
            }
        }

        walk(el) {
            el.setAttribute('key', nanoid(6));

            _.each(el.children, child => {
                let x = this.walk(child);
            });
        }

        walkStatus(el) {
            let id = el.getAttribute('id');

            let resultReactElement = null;
            let props = {};
            let children = [];

            _.each(el.attributes, attr => {
                let k = attr.name;
                if (k.startsWith('xmlns')) return;
                if (['line-spacing'].includes(k)) return;

                if (k === 'class') { k = 'className'; }

                // change xxx-yyy-zzz to xxxYyyZzz
                if (k.includes('-')) {
                    let slices = k.split('-');
                    let newSlices = [slices[0]];
                    for (let i = 1; i < slices.length; ++i) {
                        let slice = slices[i];
                        slice = slice.charAt(0).toUpperCase() + slice.slice(1);
                        newSlices.push(slice);
                    }
                    k = newSlices.join('');
                }

                if (k.startsWith('xlink')) {
                    k = k.replace('xlink:', '');
                }

                props[k] = attr.value;

                if (el.tagName === 'text') {
                    delete props.id;
                }
            });

            _.each(el.children, child => {
                let x = this.walkStatus(child);
                if (x) { children.push(x); }
            });

            if (children.length === 0 && el.innerHTML) {
                children = el.innerHTML;
            }

            resultReactElement = e(el.tagName, props, children);
            return resultReactElement;
        }

        render() {
            let reactSVGElement = null;
            if (this.mapCache) {
                reactSVGElement = this.walkStatus(this.mapCache.root);
            }

            return <WrappedComponent
                svgRef={this.svgRef}
                transform={`translate(${this.state.offsetX}, ${this.state.offsetY}) scale(${this.state.scale})`}
                reactSVGElement={reactSVGElement}
            />;
        }
    };
};

export default hoc(System);