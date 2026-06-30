import path from 'path'
import frappeUIPreset from 'frappe-ui/tailwind'

export default {
  presets: [frappeUIPreset],
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
