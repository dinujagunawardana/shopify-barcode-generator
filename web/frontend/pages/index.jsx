import {
  Page,
  Layout,
  Card
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";

import { trophyImage } from "../assets";

import { BarcodeGenerator } from "../components/BarcodeGenerator";

export default function HomePage() {
  return (
    <Page>
      <TitleBar title="Barcode Generator" />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <BarcodeGenerator />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
