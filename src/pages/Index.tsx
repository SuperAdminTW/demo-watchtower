import { useState, useMemo } from 'react';
import { TranslationItem, TranslationState } from '@/types/translation';
import { useTranslations } from '@/hooks/useTranslations';
import { Header } from '@/components/Header';
import { StateFilter } from '@/components/StateFilter';
import { TranslationTable } from '@/components/TranslationTable';
import { TranslationDetail } from '@/components/TranslationDetail';
import { StatsCard } from '@/components/StatsCard';
import { NewTranslationForm } from '@/components/NewTranslationForm';
import { 
  Inbox, 
  CheckCircle2, 
  AlertTriangle, 
  Database,
  FileText
} from 'lucide-react';

const Index = () => {
  const { items, isRefreshing, refresh, addItem, performAction, counts } = useTranslations();
  const [selectedItem, setSelectedItem] = useState<TranslationItem | null>(null);
  const [filterState, setFilterState] = useState<TranslationState | 'all'>('all');

  const filteredItems = useMemo(() => {
    if (filterState === 'all') return items;
    return items.filter((item) => item.state === filterState);
  }, [items, filterState]);

  const handleSelectItem = (item: TranslationItem) => {
    setSelectedItem(item);
  };

  const handleAction = async (item: TranslationItem, action: string, edits?: { key?: string; zu?: string; ko?: string; en?: string }) => {
    await performAction(item, action, edits);
    // Update the selected item with new state
    const updatedItem = items.find((i) => i.id === item.id);
    if (updatedItem) {
      setSelectedItem({ ...updatedItem });
    }
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Recalculate selected item when items change
  const currentSelectedItem = selectedItem 
    ? items.find((i) => i.id === selectedItem.id) || null 
    : null;

  const handleAddTranslation = (key: string, zu: string) => {
    const newItem = addItem(key, zu);
    setSelectedItem(newItem);
  };

  const existingKeys = useMemo(() => items.map((i) => i.key), [items]);

  return (
    <div className="min-h-screen bg-background">
      <Header onRefresh={refresh} isRefreshing={isRefreshing} />
      
      <main className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Pending"
            value={counts.received + counts.draft}
            icon={Inbox}
            trend="neutral"
            trendValue="Awaiting action"
          />
          <StatsCard
            title="In Progress"
            value={counts.approved + counts.translated}
            icon={CheckCircle2}
            trend="up"
            trendValue="Being processed"
          />
          <StatsCard
            title="Needs Review"
            value={counts.review_required}
            icon={AlertTriangle}
            trend={counts.review_required > 0 ? 'down' : 'neutral'}
            trendValue={counts.review_required > 0 ? 'Requires attention' : 'All clear'}
          />
          <StatsCard
            title="Stored"
            value={counts.stored}
            icon={Database}
            trend="up"
            trendValue="In Translation Memory"
          />
        </div>

        {/* Actions & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <NewTranslationForm 
            onSubmit={handleAddTranslation}
            existingKeys={existingKeys}
          />
          <StateFilter
            selectedState={filterState}
            onStateChange={setFilterState}
            counts={counts}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table */}
          <div className="lg:col-span-1">
            {filteredItems.length > 0 ? (
              <TranslationTable
                items={filteredItems}
                onSelectItem={handleSelectItem}
                selectedId={currentSelectedItem?.id}
              />
            ) : (
              <div className="watchtower-card p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Translations Yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click "New Translation" to add your first key and start the workflow.
                </p>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {currentSelectedItem ? (
              <TranslationDetail
                key={currentSelectedItem.id + currentSelectedItem.state}
                item={currentSelectedItem}
                onAction={handleAction}
                onClose={handleCloseDetail}
              />
            ) : (
              <div className="watchtower-card p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No Translation Selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click on a translation key from the table to view details and perform actions.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
