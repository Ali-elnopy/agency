import { useEffect, useState } from 'react';
import { AVATAR_EVENT, getAvatar } from '../services/avatarStore';

/**
 * Subscribe to the browser-local photo for one member email.
 * Returns `undefined` when no photo was ever set, `''` when it was removed,
 * and a data URL when a photo exists.
 */
export default function useAvatar(email) {
  const [avatar, setAvatar] = useState(() => getAvatar(email));

  useEffect(() => {
    setAvatar(getAvatar(email));

    const refresh = () => setAvatar(getAvatar(email));

    window.addEventListener(AVATAR_EVENT, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(AVATAR_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [email]);

  return avatar;
}
