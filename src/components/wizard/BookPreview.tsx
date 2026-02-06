/**
 * BookPreview Component
 * 
 * Displays the final generated book with cover, pages, and back cover.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Star,
  Grid,
  Layers,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { FinalBookPackage, BookPage } from '../../lib/api';
import { getAssetUrl } from '../../lib/api';

interface BookPreviewProps {
  result: FinalBookPackage;
  jobId: string;
}

type ViewMode = 'carousel' | 'grid';

function PageCard({ 
  page, 
  jobId, 
  onClick,
  isSelected = false
}: { 
  page: BookPage; 
  jobId: string;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  // Extract filename from path
  const filename = page.image_path.split('/').pop() || '';
  const imageUrl = getAssetUrl(jobId, 'outputs', filename);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden cursor-pointer shadow-lg ${
        isSelected ? 'ring-4 ring-primary-teal' : ''
      }`}
    >
      <img
        src={imageUrl}
        alt={`Page ${page.page_number}`}
        className="w-full aspect-[3/4] object-cover bg-gray-100"
        onError={(e) => {
          // Fallback for missing images
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect fill="%23f3f4f6" width="300" height="400"/><text x="150" y="200" text-anchor="middle" fill="%239ca3af">No Image</text></svg>';
        }}
      />
      
      {/* Page Label */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
        {page.page_type === 'cover' ? 'Cover' : 
         page.page_type === 'back_cover' ? 'Back' : 
         `Page ${page.page_number}`}
      </div>
      
      {/* Life Phase Badge */}
      {page.life_phase && (
        <div className="absolute top-2 right-2 bg-primary-teal/90 text-white px-2 py-1 rounded text-xs capitalize">
          {page.life_phase}
        </div>
      )}
    </motion.div>
  );
}

function CarouselView({ pages, jobId }: { pages: BookPage[]; jobId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : pages.length - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev < pages.length - 1 ? prev + 1 : 0));
  };
  
  const currentPage = pages[currentIndex];
  const filename = currentPage.image_path.split('/').pop() || '';
  const imageUrl = getAssetUrl(jobId, 'outputs', filename);
  
  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative aspect-[3/4] max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={imageUrl}
            alt={`Page ${currentPage.page_number}`}
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect fill="%23f3f4f6" width="300" height="400"/><text x="150" y="200" text-anchor="middle" fill="%239ca3af">No Image</text></svg>';
            }}
          />
        </AnimatePresence>
        
        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      
      {/* Page Info */}
      <div className="text-center mt-6">
        <div className="text-lg font-medium text-gray-800">
          {currentPage.page_type === 'cover' ? 'Cover' : 
           currentPage.page_type === 'back_cover' ? 'Back Cover' : 
           `Page ${currentPage.page_number}`}
        </div>
        {currentPage.memory_reference && (
          <p className="text-sm text-gray-500 mt-1">{currentPage.memory_reference}</p>
        )}
        <div className="text-xs text-gray-400 mt-2">
          {currentIndex + 1} of {pages.length}
        </div>
      </div>
      
      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-6 overflow-x-auto pb-2 px-4">
        {pages.map((page, idx) => {
          const thumbFilename = page.image_path.split('/').pop() || '';
          const thumbUrl = getAssetUrl(jobId, 'outputs', thumbFilename);
          
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? 'border-primary-teal' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={thumbUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GridView({ pages, jobId }: { pages: BookPage[]; jobId: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {pages.map((page, idx) => (
        <PageCard key={idx} page={page} jobId={jobId} />
      ))}
    </div>
  );
}

function ReviewSummary({ result }: { result: FinalBookPackage }) {
  const review = result.design_review;
  if (!review) return null;
  
  const avgScore = (
    (review.overall_cohesion + 
     review.style_consistency_score + 
     review.color_palette_harmony + 
     review.narrative_flow + 
     review.character_consistency) / 5
  ).toFixed(1);
  
  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        Design Review
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Cohesion', value: review.overall_cohesion },
          { label: 'Style', value: review.style_consistency_score },
          { label: 'Colors', value: review.color_palette_harmony },
          { label: 'Flow', value: review.narrative_flow },
          { label: 'Character', value: review.character_consistency },
        ].map((item, idx) => (
          <div key={idx} className="text-center">
            <div className="text-2xl font-bold text-gray-800">{item.value.toFixed(1)}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-2">
          {review.approved ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
          <span className={review.approved ? 'text-green-700' : 'text-yellow-700'}>
            {review.approved ? 'Approved' : 'Needs Review'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Average Score:</span>
          <span className="ml-2 text-xl font-bold text-gray-800">{avgScore}/10</span>
        </div>
      </div>
      
      {review.global_suggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Suggestions</h4>
          <ul className="text-sm text-gray-500 space-y-1">
            {review.global_suggestions.map((suggestion, idx) => (
              <li key={idx}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function BookPreview({ result, jobId }: BookPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  
  // Combine all pages in order: cover, pages, back_cover
  const allPages: BookPage[] = [
    result.cover,
    ...result.pages.sort((a, b) => a.page_number - b.page_number),
    result.back_cover,
  ];
  
  const handleDownload = () => {
    // Open result JSON in new tab for now
    const dataStr = JSON.stringify(result, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memorybook-${result.book_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{result.title}</h2>
          <p className="text-gray-500">
            {result.total_pages} pages • {result.style} style
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('carousel')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'carousel' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
            >
              <Layers className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary-teal text-white rounded-lg hover:bg-primary-teal/90 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      {/* Book View */}
      {viewMode === 'carousel' ? (
        <CarouselView pages={allPages} jobId={jobId} />
      ) : (
        <GridView pages={allPages} jobId={jobId} />
      )}
      
      {/* Review Summary */}
      <ReviewSummary result={result} />
      
      {/* Stats */}
      <div className="flex justify-center gap-8 text-center text-sm text-gray-500">
        <div>
          <div className="font-medium text-gray-700">{result.total_generation_time_ms / 1000}s</div>
          <div>Generation Time</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">{result.total_retries}</div>
          <div>Retries</div>
        </div>
        <div>
          <div className="font-medium text-gray-700">{allPages.length}</div>
          <div>Total Pages</div>
        </div>
      </div>
    </div>
  );
}

export default BookPreview;
