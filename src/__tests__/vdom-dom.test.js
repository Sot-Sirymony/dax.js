import VirtualDOM from '../vdom';

describe('VirtualDOM DOM Operations', () => {
    let vdom;
    let container;

    beforeEach(() => {
        vdom = new VirtualDOM();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    describe('create', () => {
        test('creates DOM element from virtual node', () => {
            const vNode = vdom.createElement('div', { className: 'test' });
            const element = vdom.create(vNode);
            
            expect(element instanceof HTMLElement).toBe(true);
            expect(element.tagName.toLowerCase()).toBe('div');
            expect(element.className).toBe('test');
        });

        test('creates text node from string', () => {
            const vNode = 'Hello';
            const element = vdom.create(vNode);
            
            expect(element instanceof Text).toBe(true);
            expect(element.textContent).toBe('Hello');
        });

        test('creates element with event listeners', () => {
            const clickHandler = jest.fn();
            const vNode = vdom.createElement('button', { onClick: clickHandler });
            const element = vdom.create(vNode);
            
            element.click();
            expect(clickHandler).toHaveBeenCalled();
        });
    });

    describe('patch', () => {
        test('creates new element', () => {
            const vNode = vdom.createElement('div');
            const patches = { type: 'CREATE', newNode: vNode };
            
            vdom.patch(container, patches);
            expect(container.children.length).toBe(1);
            expect(container.firstChild.tagName.toLowerCase()).toBe('div');
        });

        test('removes element', () => {
            const vNode = vdom.createElement('div');
            container.appendChild(vdom.create(vNode));
            const patches = { type: 'REMOVE' };
            
            vdom.patch(container, patches, 0);
            expect(container.children.length).toBe(0);
        });

        test('replaces element', () => {
            const oldVNode = vdom.createElement('div');
            container.appendChild(vdom.create(oldVNode));
            const newVNode = vdom.createElement('span');
            const patches = { type: 'REPLACE', newNode: newVNode };
            
            vdom.patch(container, patches, 0);
            expect(container.children.length).toBe(1);
            expect(container.firstChild.tagName.toLowerCase()).toBe('span');
        });

        test('patches nested elements', () => {
            const oldVNode = vdom.createElement('div', {}, 
                vdom.createElement('span')
            );
            container.appendChild(vdom.create(oldVNode));
            
            const newVNode = vdom.createElement('div', {}, 
                vdom.createElement('p')
            );
            const patches = vdom.diff(oldVNode, newVNode);
            
            vdom.patch(container, patches, 0);
            expect(container.firstChild.firstChild.tagName.toLowerCase()).toBe('p');
        });
    });

    describe('memoization', () => {
        test('memoizes created elements', () => {
            const vNode = vdom.createElement('div', { key: 'test' });
            const element1 = vdom.create(vNode);
            const element2 = vdom.create(vNode);
            
            expect(element1).toBe(element2);
        });
    });
});