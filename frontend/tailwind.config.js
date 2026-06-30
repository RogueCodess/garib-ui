import path from 'path'

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js}',
    path.resolve(__dirname, 'node_modules/frappe-ui/src/**/*.{vue,js}'),
  ],
  theme: {
    extend: {
      colors: {
        brand: '#1a56db',
      },
    },
  },
  plugins: [],
}
