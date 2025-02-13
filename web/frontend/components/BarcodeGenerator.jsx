import { useState, useCallback, useRef } from 'react';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  Button,
  Stack,
  Banner,
  Modal,
  Select,
  RangeSlider,
  ChoiceList,
} from '@shopify/polaris';
import { useAppQuery } from '../hooks';
import JsBarcode from 'jsbarcode';
import { useReactToPrint } from 'react-to-print';

const LABEL_TYPES = [
  { label: 'Standard Paper Labels', value: 'standard' },
  { label: 'Label Maker', value: 'labelMaker' },
];

const STANDARD_SIZES = [
  { label: 'Small (1.5" x 1")', value: 'small' },
  { label: 'Medium (2" x 1.25")', value: 'medium' },
  { label: 'Large (3" x 2")', value: 'large' },
  { label: 'Custom', value: 'custom' },
];

const LABEL_MAKER_SIZES = [
  { label: 'DYMO 30252 (1.125" x 3.5")', value: 'dymo30252' },
  { label: 'DYMO 30336 (1" x 2.125")', value: 'dymo30336' },
  { label: 'Brother DK-2205 (2.4")', value: 'brotherDK2205' },
  { label: 'Brother DK-1201 (1.1" x 3.5")', value: 'brotherDK1201' },
  { label: 'Custom', value: 'custom' },
];

export function BarcodeGenerator() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [labelType, setLabelType] = useState('standard');
  const [barcodeSize, setBarcodeSize] = useState('medium');
  const [customWidth, setCustomWidth] = useState(2);
  const [customHeight, setCustomHeight] = useState(1.25);
  const [orientation, setOrientation] = useState(['horizontal']);
  const printRef = useRef();

  // Fetch products from Shopify
  const {
    data: products,
    isLoading,
    isError,
  } = useAppQuery({
    url: '/api/products',
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const getSizeStyles = () => {
    const isVertical = orientation[0] === 'vertical';
    
    if (labelType === 'labelMaker') {
      switch (barcodeSize) {
        case 'dymo30252':
          return { width: '3.5in', height: '1.125in' };
        case 'dymo30336':
          return { width: '2.125in', height: '1in' };
        case 'brotherDK2205':
          return { width: '2.4in', height: '1.5in' };
        case 'brotherDK1201':
          return { width: '3.5in', height: '1.1in' };
        case 'custom':
          return isVertical 
            ? { width: `${customHeight}in`, height: `${customWidth}in` }
            : { width: `${customWidth}in`, height: `${customHeight}in` };
      }
    } else {
      switch (barcodeSize) {
        case 'small':
          return isVertical 
            ? { width: '1in', height: '1.5in' }
            : { width: '1.5in', height: '1in' };
        case 'large':
          return isVertical
            ? { width: '2in', height: '3in' }
            : { width: '3in', height: '2in' };
        case 'custom':
          return isVertical
            ? { width: `${customHeight}in`, height: `${customWidth}in` }
            : { width: `${customWidth}in`, height: `${customHeight}in` };
        default: // medium
          return isVertical
            ? { width: '1.25in', height: '2in' }
            : { width: '2in', height: '1.25in' };
      }
    }
  };

  const generateBarcode = useCallback((product) => {
    const canvas = document.createElement('canvas');
    const barcodeValue = product.variants[0]?.sku || product.id;
    const isVertical = orientation[0] === 'vertical';
    
    JsBarcode(canvas, barcodeValue, {
      format: 'CODE128',
      width: 1.5,
      height: isVertical ? 60 : 40,
      displayValue: true,
      fontSize: 8,
      margin: 2,
    });
    return canvas.toDataURL('image/png');
  }, [orientation]);

  const handleBulkAction = useCallback(() => {
    setShowPreview(true);
  }, []);

  const renderItem = (item) => {
    const { title, variants } = item;
    const price = variants[0]?.price;
    const sku = variants[0]?.sku;
    
    return (
      <ResourceList.Item id={item.id}>
        <Stack>
          <Stack.Item fill>
            <h3>{title}</h3>
            <div>Price: ${price}</div>
            {sku && <div>SKU: {sku}</div>}
          </Stack.Item>
          <Stack.Item>
            <Button onClick={() => {
              setSelectedItems([item]);
              setShowPreview(true);
            }}>
              Generate Barcode
            </Button>
          </Stack.Item>
        </Stack>
      </ResourceList.Item>
    );
  };

  const renderSizeControls = () => (
    <Stack vertical spacing="tight">
      <Select
        label="Label Type"
        options={LABEL_TYPES}
        value={labelType}
        onChange={(value) => {
          setLabelType(value);
          setBarcodeSize(value === 'labelMaker' ? 'dymo30252' : 'medium');
        }}
      />
      <Select
        label="Label Size"
        options={labelType === 'labelMaker' ? LABEL_MAKER_SIZES : STANDARD_SIZES}
        value={barcodeSize}
        onChange={setBarcodeSize}
      />
      {barcodeSize === 'custom' && (
        <>
          <RangeSlider
            label="Width (inches)"
            value={customWidth}
            min={1}
            max={labelType === 'labelMaker' ? 4 : 5}
            step={0.125}
            onChange={setCustomWidth}
          />
          <RangeSlider
            label="Height (inches)"
            value={customHeight}
            min={0.5}
            max={labelType === 'labelMaker' ? 2.4 : 4}
            step={0.125}
            onChange={setCustomHeight}
          />
        </>
      )}
      <ChoiceList
        title="Label Orientation"
        choices={[
          {label: 'Horizontal', value: 'horizontal'},
          {label: 'Vertical', value: 'vertical'},
        ]}
        selected={orientation}
        onChange={setOrientation}
      />
    </Stack>
  );

  const renderBarcodePreview = () => (
    <div ref={printRef}>
      {selectedItems.map((item) => {
        const sku = item.variants[0]?.sku;
        const isVertical = orientation[0] === 'vertical';
        
        return (
          <div 
            key={item.id} 
            style={{
              ...getSizeStyles(),
              margin: '0.125in',
              padding: '0.1in',
              border: '1px dashed #ccc',
              pageBreakInside: 'avoid',
              textAlign: 'center',
              fontSize: labelType === 'labelMaker' ? '7px' : '9px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transform: isVertical ? 'rotate(90deg)' : 'none',
              transformOrigin: 'left top'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.05in' }}>{item.title}</div>
            <div style={{ marginBottom: '0.05in' }}>${item.variants[0]?.price}</div>
            {sku && <div style={{ marginBottom: '0.05in' }}>SKU: {sku}</div>}
            <img 
              src={generateBarcode(item)} 
              alt={`Barcode for ${item.title}`}
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                transform: isVertical ? 'rotate(-90deg)' : 'none',
                transformOrigin: 'center center'
              }}
            />
          </div>
        );
      })}
    </div>
  );

  if (isError) {
    return (
      <Banner status="critical">
        There was an error loading products. Please try again.
      </Banner>
    );
  }

  return (
    <Page title="Barcode Generator">
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              loading={isLoading}
              items={products || []}
              renderItem={renderItem}
              selectedItems={selectedItems}
              onSelectionChange={setSelectedItems}
              selectable
              bulkActions={[
                {
                  content: 'Generate Bulk Barcodes',
                  onAction: handleBulkAction,
                },
              ]}
            />
          </Card>
        </Layout.Section>

        <Modal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          title="Barcode Preview"
          primaryAction={{
            content: 'Print Barcodes',
            onAction: handlePrint,
          }}
          secondaryActions={[
            {
              content: 'Close',
              onAction: () => setShowPreview(false),
            },
          ]}
        >
          <Modal.Section>
            {renderSizeControls()}
            <div style={{ marginTop: '1rem' }}>
              {renderBarcodePreview()}
            </div>
          </Modal.Section>
        </Modal>
      </Layout>
    </Page>
  );
}
