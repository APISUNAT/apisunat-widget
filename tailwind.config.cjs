module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				ink: '#132238',
				accent: '#1d5c94'
			},
			fontFamily: {
				display: ['\"Iowan Old Style\"', '\"Palatino Linotype\"', 'serif']
			}
		}
	},
	plugins: [require('@tailwindcss/forms')]
};