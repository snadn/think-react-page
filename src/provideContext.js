import React, {PropTypes, createElement} from 'react';

export default function provideContext(context, Component){
	if (arguments.length < 2) return provideContext.bind(null, context);

	const childContextTypes = {};

	Object.entries(context).forEach(([key, val]) => {
		childContextTypes[key] = PropTypes[typeof val];
	});

	return class ContextProvider extends React.Component {
		static childContextTypes = childContextTypes;
		getChildContext() {
			return context;
		}
		render(){
			return createElement(Component, this.props);
		}
	};
}
