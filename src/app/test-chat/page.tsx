'use client';

import { useState } from 'react';
import { Layout, ProtectedRoute, Button, Card } from '@/components';
import { ChatTerminal } from '@/components/ChatTerminal';

export default function TestChatPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<string>('');

  const tickers = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA'];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Chat Terminal Test
          </h1>

          <Card title="Open Chat" className="mb-8">
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Click a ticker to open the chat terminal for that stock.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {tickers.map((ticker) => (
                  <Button
                    key={ticker}
                    onClick={() => {
                      setSelectedTicker(ticker);
                      setIsChatOpen(true);
                    }}
                    variant={selectedTicker === ticker ? 'primary' : 'secondary'}
                  >
                    {ticker}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">
                Chat Terminal is open on the right →
              </p>
              <p className="text-sm text-gray-500">
                Try asking questions like: &quot;What's the valuation of AAPL?&quot;
              </p>
            </div>
          </Card>
        </div>

        {/* Chat Terminal */}
        <ChatTerminal
          ticker={selectedTicker}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </Layout>
    </ProtectedRoute>
  );
}
