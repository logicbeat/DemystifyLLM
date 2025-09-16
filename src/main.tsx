import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { store } from './app/store'
import { Provider } from 'react-redux'

const basePath = import.meta.env.PROD ? "/DemystifyLLM" : "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={basePath}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
