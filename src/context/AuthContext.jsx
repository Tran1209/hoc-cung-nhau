import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { data } from '../data';
import { onDataChange } from '../data/events';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = đang tải, null = chưa đăng nhập
  const [people, setPeople] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const u = await data.auth.current();
      if (u && !u.missingProfile) {
        const ps = await data.list('profiles');
        setPeople(ps);
        setUser(ps.find((p) => p.id === u.id) || u);
      } else {
        setUser(u);
      }
    } catch (e) {
      console.error(e);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const off1 = data.auth.onChange(refresh);
    // đổi tên hiển thị -> cập nhật ngay
    const off2 = onDataChange(async () => {
      if (!data.me()) return;
      try {
        const ps = await data.list('profiles');
        setPeople(ps);
        setUser((u) => (u ? ps.find((p) => p.id === u.id) || u : u));
      } catch { /* bỏ qua */ }
    });
    return () => { off1(); off2(); };
  }, [refresh]);

  const value = {
    user,
    people,
    isTeacher: user?.role === 'teacher',
    partner: people.find((p) => p.id !== user?.id) || null,
    nameOf: (id) => people.find((p) => p.id === id)?.display_name || 'Ai đó',
    refresh,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
