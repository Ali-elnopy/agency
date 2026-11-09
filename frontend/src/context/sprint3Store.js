import { createContext, useContext } from 'react';

export const Sprint3Context = createContext(null);

const DEFAULT_CONTEXT = {
  lang: 'en',
  setLang: () => {},
  t: (text) => text,
  role: 'admin',
  setRole: () => {},
  templates: [],
  dispatches: [],
  briefs: [],
  strategies: [],
  campaigns: [],
  contentMeta: {},
  settings: {},
  tasks: [],
  addTask: () => {},
  updateTask: () => {},
  deleteTask: () => {},
  changeTaskStatus: () => {},
  autoConvertContentToTasks: () => {},
};

export function useSprint3() {
  const value = useContext(Sprint3Context);
  if (!value) {
    return DEFAULT_CONTEXT;
  }
  return value;
}
