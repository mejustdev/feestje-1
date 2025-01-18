import { AuthConfig } from './types';
import { isProd } from '../utils/env';

const PROD_URL = 'https://your-site-name.netlify.app'; // Replace with your actual Netlify URL

export const authConfig: AuthConfig = {
  providers: ['google'],
  redirectUrl: isProd ? `${PROD_URL}/auth/callback` : `${window.location.origin}/auth/callback`
};