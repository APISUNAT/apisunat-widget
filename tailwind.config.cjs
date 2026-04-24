module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			boxShadow: {
				glass: '0 28px 60px -26px rgba(15, 23, 42, 0.45)',
				innerline: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)'
			},
			colors: {
				mist: '#f4f7fb',
				ink: '#132238',
				accent: '#1d5c94',
				accentsoft: '#d9ebf8'
			},
			fontFamily: {
				display: ['\"Iowan Old Style\"', '\"Palatino Linotype\"', 'serif'],
				body: ['\"Segoe UI\"', '\"Helvetica Neue\"', 'sans-serif'],
				mono: ['\"IBM Plex Mono\"', '\"Courier New\"', 'monospace']
			}
		}
	},
	plugins: []
};