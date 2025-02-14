import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "@shopify/polaris";
import { Provider, useAppBridge } from "@shopify/app-bridge-react";
import { QueryProvider } from "./components";
import translations from "@shopify/polaris/locales/en.json";
import Routes from "./Routes";

function AppBridgeWrapper({ children }) {
  const app = useAppBridge();
  return <QueryProvider>{children}</QueryProvider>;
}

export default function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  // Get API key from meta tag
  const apiKey = document
    .querySelector('meta[name="shopify-api-key"]')
    ?.getAttribute("content");

  const config = {
    apiKey: apiKey,
    host: new URLSearchParams(window.location.search).get("host"),
    forceRedirect: true
  };

  return (
    <Provider config={config}>
      <AppProvider i18n={translations}>
        <BrowserRouter>
          <AppBridgeWrapper>
            <Routes pages={pages} />
          </AppBridgeWrapper>
        </BrowserRouter>
      </AppProvider>
    </Provider>
  );
}
