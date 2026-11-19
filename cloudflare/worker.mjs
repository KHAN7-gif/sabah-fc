import { onRequest as admin } from '../functions/api/admin/[[path]].js';
import { onRequest as notifications } from '../functions/api/notifications/[[path]].js';

export default {
  fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith('/api/admin/')) {
      return admin({ request, env });
    }
    if (pathname.startsWith('/api/notifications/')) {
      return notifications({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
