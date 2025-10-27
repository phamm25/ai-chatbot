import { createContext, useContext, useReducer, ReactNode } from 'react';
import { chatReducer, initialState, ChatState, ChatAction } from '../state-manager/chatReducer';

interface ChatContextValue extends ChatState {
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const value: ChatContextValue = {
    ...state,
    dispatch,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
