// Netlify Server entry: runs the AgreeWise API (Express) on Netlify.
// Static frontend files are served from the publish directory (dist/).
import { createApp } from '../../api/app.ts';

export const config = {
  path: '/api/*',
};

export default createApp();
