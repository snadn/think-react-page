# think-react-page

thinkjs 插件，在 thinkjs 中使用 react 来构建同构的 webpage

## 安装

`npm install think-react-page --save`

## 使用

1. 编辑 bootstrap/middleware.js，引入插件

	```javascript
	require('think-react-page')
	```

2. 在 view 目录下创建 base.html 模板文件，例如

	```html
	<!doctype html>
	<html>
		<head>
			<title>DEMO</title>
		</head>
		<body>
			<div id="react-wraper">{{html}}</div>
			<script src="/static/js/lib/react.js"></script>
			<script src="/static/js/lib/react-dom.js"></script>
			<script>
				window.G = {{GStr}};
			</script>
			<script src="{{pageScript}}"></script>
	</html>
	```

3. 在 view/home 中创建相应的视图文件，例如 IndexIndexPage.js

	- 命名规则 \[Controller\]\[Action\]Page.js 首字母大写
	- 在视图中导出命名为 Page 的 Component，例如

		```jsx
		import React, {Component} from 'react'
		export class Page extends Component {
			render() {
				return 'React Demo';
			}
		}
		```

4. 在 www/static/js/index 中创建浏览器端执行脚本 index.jsx，例如

	```jsx
	import ReactDOM from 'react-dom';
	import {Page} from 'HomePage/IndexIndexPage'; // HomePage 为 webpack 中定义的别名，即 /view/home
	ReactDOM.render(<Page location={location} context={G.context} />, document.getElementById('react-wraper'));
	```

	然后使用 webpack 编译 index.jsx => index.js

5. 在 controller 中 assign('pageScript', '/static/js/index/index.js')，
	或者在 view 的配置中指定 getPageScript 方法来返回页面对应的浏览器端脚本路径

## 潜规则

1. 在 node 端，渲染 Page 时会传入 location 和 context 两个 props。

	- location 为 url.parse(http.req.url) 的结果
	- context 中为 controller 中 assgin 传入的参数

2. 处理 base.html 模板时

	- 使用 Page 渲染成的字符串替换 {{html}}
	- 将全部变量 G JSON.stringify 后，替换 {{GStr}}
	- 使用浏览器端脚本路径替换 {{pageScript}}

## 配置

```javascript
import path from 'path'

// 自定义的映射表，用于静态资源构建后名称改变的情况
try {
	var map = require(path.join(think.ROOT_PATH, './page_map.json'));
} catch(e){
	var map = { res: {} };
}

// 我的项目中获取浏览器端脚本url的规则，根据项目情况自定义
function getPageScript(templateFile, options) {

	let dirname = path.dirname(templateFile).split(options.root_path)[1];
	let basename = path.basename(templateFile).replace(/^[A-Z]/, function(w){
		return w.toLowerCase();
	}).replace(/[A-Z]/, function(w){
		return '/'+w.toLowerCase();
	});

	let pageName = dirname + '/' + basename;

	let pagePath = "/static/js/" + pageName;
	if (map.res['webpack/' + pageName]) {
		pagePath = map.res['webpack/' + pageName].uri
	}

	return pagePath;
}

export default {
	type: 'react',
	content_type: 'text/html',
	file_ext: 'Page.js',
	file_depr: '_',
	root_path: path.join(think.ROOT_PATH, 'view/'),
	adapter: {
		react: {
			getPageScript, // 浏览器端脚本url的获取方法
			globalVarName: 'DEMO', // 要使用的全局变量的名称，默认为 G
			server_render: true // 是否开启服务端渲染
		}
	}
};
```
