import { create } from 'zustand';

const useNotifStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (post) =>
    set((state) => ({
      notifications: [{ id: post._id, post, read: false, createdAt: new Date() }, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));

export default useNotifStore;