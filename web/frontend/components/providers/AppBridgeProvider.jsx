import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Provider } from "@shopify/app-bridge-react";
import { Banner, Layout, Page } from "@shopify/polaris";

export function AppBridgeProvider({ children }) {
  const location = useLocation();

  const appBridgeConfig = useMemo(
    () => ({
      apiKey: process.env.VITE_SHOPIFY_API_KEY,
      host: new URL(location.pathname + location.search, window.location.href).searchParams.get("host"),
      forceRedirect: true,
    }),
    [location]
  );

  if (!process.env.VITE_SHOPIFY_API_KEY) {
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <Banner title="Missing Shopify API key" status="critical">
              Your app is running without the SHOPIFY_API_KEY environment variable.
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return <Provider config={appBridgeConfig}>{children}</Provider>;
}
