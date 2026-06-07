import { create } from 'zustand';
import { Chat, Message } from '@/types';
import { aiAPI } from '@/services/api';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  isSending: boolean;

  setActiveChat: (chat: Chat | null) => void;
  fetchChats: () => Promise<void>;
  fetchChatById: (id: string) => Promise<void>;
  sendMessage: (message: string, language?: string, subject?: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  isLoading: false,
  isSending: false,

  setActiveChat: (chat) => set({ activeChat: chat }),

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const res = await aiAPI.getChats();
      set({ chats: res.data.data.chats, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchChatById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await aiAPI.getChatById(id);
      set({ activeChat: res.data.data.chat, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (message, language = 'arabic', subject = 'general') => {
    const { activeChat } = get();
    const userMessage: Message = { role: 'user', content: message, timestamp: new Date().toISOString() };

    if (activeChat) {
      set({
        activeChat: {
          ...activeChat,
          messages: [...activeChat.messages, userMessage]
        },
        isSending: true
      });
    } else {
      set({ isSending: true });
    }

    try {
      const res = await aiAPI.sendMessage({
        message,
        chatId: activeChat?._id,
        language,
        subject
      });

      const { chat } = res.data.data;
      set({
        activeChat: chat,
        isSending: false,
        chats: [chat, ...get().chats.filter(c => c._id !== chat._id)]
      });
    } catch {
      set({ isSending: false });
      throw new Error('Failed to send message');
    }
  },

  deleteChat: async (id) => {
    await aiAPI.deleteChat(id);
    const { activeChat } = get();
    set({
      chats: get().chats.filter(c => c._id !== id),
      activeChat: activeChat?._id === id ? null : activeChat
    });
  },

  clearMessages: () => set({ activeChat: null })
}));
