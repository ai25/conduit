import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

const store = createStore({ loading: false });
const AppStateContext = createContext(store);
export const AppStateProvider = (props: { children: any }) => {
  return (
    <AppStateContext.Provider value={store}>
      {props.children}
    </AppStateContext.Provider>
  );
};
export const useAppState = () => {
  const context = useContext(AppStateContext);
  return context;
};
