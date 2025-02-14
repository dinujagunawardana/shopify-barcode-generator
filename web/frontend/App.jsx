import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import { Provider } from "@shopify/app-bridge-react";
import translations from "@shopify/polaris/locales/en.json";
import Routes from "./Routes";

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  const config = {
    apiKey: process.env.VITE_SHOPIFY_API_KEY,
    host: new URLSearchParams(window.location.search).get("host"),
    forceRedirect: true,
  };

  return (
    <Provider config={config}>
      <AppProvider i18n={translations}>
        <BrowserRouter>
          <Routes pages={pages} />
        </BrowserRouter>
      </AppProvider>
    </Provider>
  );
}
