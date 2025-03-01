# DaxJS

A lightweight JavaScript library for building user interfaces with Virtual DOM.

## Features

- Virtual DOM implementation for efficient DOM updates
- Event management system
- Lifecycle management
- Props validation with type checking and custom validators

## Installation

```bash
npm install @sirymony/dax
```

## Usage

```javascript
import { VirtualDOM, EventManager, LifecycleManager, PropsValidator } from '@sirymony/dax';

// Create a virtual DOM element
const vdom = new VirtualDOM();
const element = vdom.createElement('div', { className: 'container' },
  vdom.createElement('h1', {}, 'Hello World'),
  vdom.createElement('p', {}, 'Welcome to DaxJS')
);

// Handle events
const events = new EventManager();
events.on('click', (e) => console.log('Clicked!'));

// Manage component lifecycle
const lifecycle = new LifecycleManager();
lifecycle.onMount(() => console.log('Component mounted'));

// Validate props
const validator = new PropsValidator();
const schema = {
  name: { type: 'string', required: true },
  age: { type: 'number', validator: (value) => value >= 0 }
};
const props = { name: 'John', age: 25 };
const errors = PropsValidator.validate(props, schema);
```

## API Reference

### VirtualDOM

The VirtualDOM class provides methods for creating and manipulating virtual DOM elements.

```javascript
class VirtualDOM {
  createElement(type, props = {}, ...children)
  diff(oldNode, newNode)
  patch(parent, patches, index = 0)
}
```

### PropsValidator

The PropsValidator class provides type checking and custom validation for component props.

```javascript
class PropsValidator {
  static types = {
    string, number, boolean, array, object, function
  }
  
  static validate(props, schema)
}
```

Supported validation rules:
- `type`: string | number | boolean | array | object | function
- `required`: boolean
- `validator`: (value) => boolean

## Building

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Development mode with watch
npm run dev
```

## License

MIT