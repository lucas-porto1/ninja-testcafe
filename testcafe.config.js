export default {
  baseUrl: 'http://localhost:3001',
  src: ['./tests'],
  browsers: ['chrome'],
  screenshots: {
    path: './screenshots',
    takeOnFails: true,
  },
  reporter: {
    name: 'spec',
  },
  concurrency: 1,
};
