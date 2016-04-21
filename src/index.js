import path from 'path';
import ReactTempAdapter from './adapter/template/react';

think.adapter('template', 'react', ReactTempAdapter);

think.middleware('react_template', (http, templateFile) => {

	if (path.extname(templateFile) === '.js') {
		let dirname = path.dirname(templateFile);
		let basename = path.basename(templateFile, 'Page.js')
			.replace(/_(\w)/g, (_, w) => w.toUpperCase())
			.replace(/^\w/, (w) => w.toUpperCase())
		templateFile = path.join(dirname, `${basename}Page.js`)
	}

	return templateFile;
});

think.hook('view_template', ['react_template'], 'append');