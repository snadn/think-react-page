import path from 'path';
import fs from 'fs';
import url from 'url';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const exists = function(path) {
	return new Promise((resolve) => {
		fs.exists(path, (exists) => {
			resolve(exists);
		});
	})
};
const readFile = think.promisify(fs.readFile, fs);

async function getBaseHtml(templateFile) {
	let baseHtml = '{{html}}';
	let dirname = path.dirname(templateFile);
	let file = `${think.config('view').root_path}/base.html`;

	if (await exists(file)) {
		baseHtml = await readFile(file, 'utf-8');
	}

	return baseHtml;
}
function getPageHtml(templateFile, props=null) {
	var Page = require(templateFile).Page;

	return renderToString(createElement(Page, props));
}

export default class extends think.adapter.base {
	/**
	 * get compiled content
	 * @params {String} templateFile 模版文件目录
	 * @params {Object} tVar 模版变量
	 * @params {Object} config 模版引擎配置
	 * @return {Promise} []
	 */
	async run(templateFile, tVar, config){
		if (path.extname(templateFile) === '.html') {
			return await readFile(templateFile, 'utf-8');
		}

		const options = think.parseConfig(think.extend({
			globalVarName: 'G',
			getPageScript: () => ''
		}, think.config('view'), config));

		const {
			globalVarName: G,
			server_render,
			getPageScript
		} = options;

		const {
			http,
			controller,
			action,
			config: conf,
			_,
			pageScript = getPageScript(templateFile, options),
			...context
		} = tVar;

		const location = url.parse(http.req.url, true, true);

		const base = await getBaseHtml();
		const html = server_render ? getPageHtml(templateFile, {
				location,
				context
			}) : '';

		const render = {
			[`${G}Str`]: JSON.stringify({
				...global[G],
				context
			}),
			html,
			pageScript,
		};

		return Object.keys(render).reduce(function(html, key){
			return html.replace('{{'+key+'}}', render[key]);
		}, base);
	}
}