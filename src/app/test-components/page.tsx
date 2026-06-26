'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Spinner,
  Skeleton,
  Modal,
  ToastContainer,
  Table,
  Input,
  NumberInput,
  Autocomplete,
  DatePicker,
} from '@/components';
import { useToast } from '@/hooks';
import type { TableColumn } from '@/components';

interface StockRow {
  id: number;
  ticker: string;
  shares: number;
  price: number;
}

export default function TestComponentsPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [numberValue, setNumberValue] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleToastSuccess = () => toast.success('Success! Operation completed.');
  const handleToastError = () => toast.error('Error occurred!');
  const handleToastInfo = () => toast.info('Information message');
  const handleToastWarning = () => toast.warning('Warning: something to note');

  const tableData: StockRow[] = [
    { id: 1, ticker: 'AAPL', shares: 10, price: 150.25 },
    { id: 2, ticker: 'GOOGL', shares: 5, price: 140.5 },
    { id: 3, ticker: 'MSFT', shares: 8, price: 380.0 },
  ];

  const tableColumns: TableColumn<StockRow>[] = [
    { key: 'ticker', header: 'Ticker', sortable: true },
    { key: 'shares', header: 'Shares', sortable: true, render: (val: number) => val.toFixed(0) },
    { key: 'price', header: 'Price', sortable: true, render: (val: number) => `$${val.toFixed(2)}` },
  ];

  return (
    <div className="min-h-screen bg-dark-base py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-12">Component Showcase</h1>

        {/* Buttons */}
        <Card title="Buttons" subtitle="Primary, secondary, danger, ghost variants">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button variant="primary" onClick={handleToastSuccess}>
              Primary Button
            </Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Delete Action</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button loading>Loading...</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Card>

        {/* Spinners */}
        <Card title="Spinners" subtitle="Loading indicators" className="mt-8">
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <Spinner size="sm" />
              <p className="text-sm text-gray-400 mt-2">Small</p>
            </div>
            <div className="flex flex-col items-center">
              <Spinner size="md" />
              <p className="text-sm text-gray-400 mt-2">Medium</p>
            </div>
            <div className="flex flex-col items-center">
              <Spinner size="lg" label="Loading..." />
              <p className="text-sm text-gray-400 mt-2">Large with label</p>
            </div>
          </div>
        </Card>

        {/* Skeletons */}
        <Card title="Skeletons" subtitle="Loading placeholders" className="mt-8">
          <div className="space-y-4">
            <Skeleton variant="line" />
            <div className="flex gap-4">
              <Skeleton variant="circle" />
              <Skeleton variant="line" className="flex-1" />
            </div>
            <Skeleton variant="card" />
          </div>
        </Card>

        {/* Modal */}
        <Card title="Modal" subtitle="Dialog box" className="mt-8">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
          >
            <p className="text-gray-300 mb-4">
              This is a modal dialog. Press Escape or click outside to close.
            </p>
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Confirm
              </Button>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </Modal>
        </Card>

        {/* Toast */}
        <Card title="Toast Notifications" className="mt-8">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleToastSuccess}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={handleToastError}>
              Error Toast
            </Button>
            <Button onClick={handleToastInfo}>Info Toast</Button>
            <Button variant="secondary" onClick={handleToastWarning}>
              Warning Toast
            </Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card title="Form Inputs" subtitle="Text, number, password fields" className="mt-8">
          <div className="space-y-4 max-w-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="Invalid Input"
              value="bad value"
              error="This field has an error"
            />
            <NumberInput
              label="Quantity"
              min={0}
              max={1000}
              step={1}
              prefix="$"
              decimalPlaces={2}
              value={numberValue || undefined}
              onChange={setNumberValue}
            />
          </div>
        </Card>

        {/* Autocomplete */}
        <Card title="Autocomplete" className="mt-8">
          <div className="max-w-md">
            <Autocomplete
              label="Stock Ticker"
              options={['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']}
              onSelect={(option) => toast.info(`Selected: ${option}`)}
              placeholder="Type a ticker..."
            />
          </div>
        </Card>

        {/* DatePicker */}
        <Card title="DatePicker" className="mt-8">
          <div className="max-w-md">
            <DatePicker
              label="Select a date"
              value={selectedDate}
              onChange={setSelectedDate}
            />
            <p className="text-sm text-gray-400 mt-4">
              Selected: {selectedDate.toLocaleDateString()}
            </p>
          </div>
        </Card>

        {/* Table */}
        <Card title="Data Table" subtitle="Sortable, paginated" className="mt-8">
          <Table
            columns={tableColumns}
            data={tableData}
            rowKey="id"
            emptyState="No stocks to display"
          />
        </Card>

        {/* Table Loading */}
        <Card title="Table Loading State" className="mt-8">
          <Table columns={tableColumns} data={[]} loading={true} />
        </Card>

        <ToastContainer />
      </div>
    </div>
  );
}
