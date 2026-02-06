/**
 * JobProgress Component
 * 
 * Displays job progress with step indicators, progress bar, and page status.
 */

import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Loader2, 
  AlertCircle,
  FileText,
  Image,
  Palette,
  Eye,
  Sparkles,
  Package
} from 'lucide-react';
import type { JobStatusResponse, StepInfo, PageInfo } from '../../lib/api';

interface JobProgressProps {
  status: JobStatusResponse | null;
  error: string | null;
}

// Step display configuration
const STEP_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  upload: { label: 'Upload', icon: FileText },
  normalization: { label: 'Analyzing Data', icon: FileText },
  planning: { label: 'Planning Story', icon: FileText },
  visual_analysis: { label: 'Analyzing Photos', icon: Eye },
  prompt_creation: { label: 'Creating Prompts', icon: Palette },
  prompt_review: { label: 'Reviewing Prompts', icon: Eye },
  image_generation: { label: 'Generating Images', icon: Image },
  illustration_review: { label: 'Reviewing Art', icon: Sparkles },
  design_review: { label: 'Design Review', icon: Eye },
  validation: { label: 'Validating', icon: CheckCircle },
  finalization: { label: 'Finalizing', icon: Package },
};

function StepIndicator({ step }: { step: StepInfo }) {
  const config = STEP_CONFIG[step.name] || { label: step.name, icon: Circle };
  const Icon = config.icon;
  
  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'text-green-500';
      case 'in_progress':
        return 'text-primary-teal';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-300';
    }
  };
  
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-primary-teal animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };
  
  return (
    <div className="flex items-center gap-3 py-2">
      {getStatusIcon()}
      <div className="flex-1">
        <div className={`font-medium text-sm ${getStatusColor()}`}>
          {config.label}
        </div>
        {step.status === 'failed' && step.error && (
          <div className="text-xs text-red-500 mt-1">{step.error}</div>
        )}
      </div>
      <Icon className={`w-4 h-4 ${getStatusColor()}`} />
    </div>
  );
}

function PageStatusGrid({ pages }: { pages: PageInfo[] }) {
  const getPageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'generating':
        return 'bg-primary-teal animate-pulse';
      case 'validating':
      case 'fixing':
        return 'bg-yellow-500 animate-pulse';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  };
  
  const getPageLabel = (page: PageInfo) => {
    if (page.page_type === 'cover') return 'C';
    if (page.page_type === 'back_cover') return 'B';
    return page.page_number.toString();
  };
  
  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-600 mb-3">Pages</h4>
      <div className="flex flex-wrap gap-2">
        {pages.map((page, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium text-white ${getPageColor(page.status)}`}
            title={`${page.page_type} - ${page.status}${page.retry_count > 0 ? ` (${page.retry_count} retries)` : ''}`}
          >
            {getPageLabel(page)}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-200"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary-teal"></div>
          <span>Generating</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Failed</span>
        </div>
      </div>
    </div>
  );
}

export function JobProgress({ status, error }: JobProgressProps) {
  if (!status) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-teal animate-spin mb-4" />
        <p className="text-gray-500">Starting job...</p>
      </div>
    );
  }
  
  const progressPercent = status.progress_percent;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {status.status === 'completed' ? 'Book Ready!' : 
           status.status === 'failed' ? 'Generation Failed' : 
           'Creating Your Memory Book'}
        </h3>
        <p className="text-gray-500">
          {status.status === 'completed' ? 'Your personalized memory book is ready to view' :
           status.status === 'failed' ? 'Something went wrong during generation' :
           status.current_step ? `Currently: ${STEP_CONFIG[status.current_step]?.label || status.current_step}` :
           'Initializing...'}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              status.status === 'failed' ? 'bg-red-500' :
              status.status === 'completed' ? 'bg-green-500' :
              'bg-gradient-to-r from-primary-teal to-primary-coral'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>{progressPercent}% complete</span>
          <span>
            {status.status === 'completed' ? 'Done' :
             status.status === 'failed' ? 'Failed' :
             'Processing...'}
          </span>
        </div>
      </div>
      
      {/* Error Message */}
      {(error || status.error) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">
                {error || status.error}
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Steps */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Progress Steps</h4>
        <div className="space-y-1">
          {status.steps.map((step, idx) => (
            <StepIndicator key={idx} step={step} />
          ))}
        </div>
      </div>
      
      {/* Pages Status */}
      {status.pages.length > 0 && (
        <PageStatusGrid pages={status.pages} />
      )}
    </div>
  );
}

export default JobProgress;
