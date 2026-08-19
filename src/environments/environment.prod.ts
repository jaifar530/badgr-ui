import { BadgrEnvironment } from './badgr-environment';

export const environment: BadgrEnvironment = {
	production: true,
	networksEnabled: true,
	enableErrorInterceptor: false,
	config: {
		api: {
			baseUrl: 'https://api.wissam.om',
		},
		theme: {
			welcomeMessage: 'Welcome to Wissam',
			serviceName: 'Wissam',
			showPoweredByBadgr: true,
			logoImg: {
				small: 'assets/logos/wissam-logo.svg',
				desktop: 'assets/logos/wissam-logo.svg',
			},
			loadingImg: {
				imageUrl:
					'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBzdHlsZT0ibWFyZ2luOiBhdXRvOyBiYWNrZ3JvdW5kOiByZ2IoMjQxLCAyNDIsIDI0Myk7IGRpc3BsYXk6IGJsb2NrOyIgd2lkdGg9IjIwMHB4IiBoZWlnaHQ9IjIwMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQiPgo8ZyB0cmFuc2Zvcm09InJvdGF0ZSgwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMi40IiByeT0iMi40IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzA3YWJjYyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjkxNjY2NjY2NjY2NjY2NjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvcmVjdD4KPC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDMwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMi40IiByeT0iMi40IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzA3YWJjYyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjgzMzMzMzMzMzMzMzMzMzRzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvcmVjdD4KPC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDYwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMi40IiByeT0iMi40IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzA3YWJjYyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjc1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSg5MCA1MCA1MCkiPgogIDxyZWN0IHg9IjQ3IiB5PSIyNCIgcng9IjIuNCIgcnk9IjIuNCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiMwN2FiY2MiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC42NjY2NjY2NjY2NjY2NjY2cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgxMjAgNTAgNTApIj4KICA8cmVjdCB4PSI0NyIgeT0iMjQiIHJ4PSIyLjQiIHJ5PSIyLjQiIHdpZHRoPSI2IiBoZWlnaHQ9IjEyIiBmaWxsPSIjMDdhYmNjIj4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuNTgzMzMzMzMzMzMzMzMzNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTUwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMi40IiByeT0iMi40IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzA3YWJjYyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvcmVjdD4KPC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDE4MCA1MCA1MCkiPgogIDxyZWN0IHg9IjQ3IiB5PSIyNCIgcng9IjIuNCIgcnk9IjIuNCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiMwN2FiY2MiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC40MTY2NjY2NjY2NjY2NjY3cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyMTAgNTAgNTApIj4KICA8cmVjdCB4PSI0NyIgeT0iMjQiIHJ4PSIyLjQiIHJ5PSIyLjQiIHdpZHRoPSI2IiBoZWlnaHQ9IjEyIiBmaWxsPSIjMDdhYmNjIj4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMzMzMzMzMzMzMzMzMzMzM3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjQwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMi40IiByeT0iMi40IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzA3YWJjYyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49Ii0wLjI1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgNTAgNTApIj4KICA8cmVjdCB4PSI0NyIgeT0iMjQiIHJ4PSIyLjQiIHJ5PSIyLjQiIHdpZHRoPSI2IiBoZWlnaHQ9IjEyIiBmaWxsPSIjMDdhYmNjIj4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjFzIiBiZWdpbj0iLTAuMTY2NjY2NjY2NjY2NjY2NjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvcmVjdD4KPC9nPjxnIHRyYW5zZm9ybT0icm90YXRlKDMwMCA1MCA1MCkiPgogIDxyZWN0IHg9IjQ3IiB5PSIyNCIgcng9IjIuNCIgcnk9IjIuNCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiMwN2FiY2MiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGJlZ2luPSItMC4wODMzMzMzMzMzMzMzMzMzM3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMzMwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMi40IiByeT0iMi40IiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzA3YWJjYyI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxcyIgYmVnaW49IjBzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvcmVjdD4KPC9nPgo8L3N2Zz4=',
			},
			favicons: [
				{
					href: 'assets/icon/wissam-favicon.png',
					rel: 'icon',
				},
			],
			useColorNavbar: true,
			imprintLink: 'https://wissam.om',
			termsOfServiceLink: 'https://wissam.om',
			privacyPolicyLink: 'https://wissam.om',
			showApiDocsLink: false,
			cssCustomProps: {
				// Wissam brand palette (purple #652673 / orange #ff421e), applied at
				// runtime by theme-setup.ts - the app's own theming mechanism, no CSS edits.
				'--color-interactive1': '#652673',
				'--color-interactive2': '#d6371a',
				'--color-interactive2alpha50': '#d6371a80',
				'--color-theme': '#ff421e',
				'--color-purple': '#652673',
				'--color-purple-50': '#f6f2f7',
				'--color-purple-100': '#e6dce9',
				'--color-purple-200': '#d1bed5',
				'--color-purple-300': '#ba9dc0',
				'--color-purple-400': '#a37dab',
				'--color-purple-500': '#8c5c96',
				'--color-purple-600': '#774084',
				'--color-purple-700': '#652673',
				'--color-purple-800': '#652673',
				'--color-purple-900': '#592165',
				'--color-purple-950': '#4c1c56',
			},
		},
	},
};
