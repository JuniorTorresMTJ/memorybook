/**
 * API Hooks
 * 
 * React hooks for API interactions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { JobStatusResponse, FinalBookPackage } from './types';
import { getJobStatus, getJobResult } from './client';

const MAX_CONSECUTIVE_ERRORS = 5;
const BASE_POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_INTERVAL = 30000; // 30 seconds

/**
 * Hook for polling job status with retry limits and exponential backoff.
 * 
 * @param jobId - Job identifier
 * @param pollInterval - Base polling interval in milliseconds (default: 2000)
 * @returns Job status, result, error, and control functions
 */
export function useJobPolling(
  jobId: string | null,
  pollInterval: number = BASE_POLL_INTERVAL
) {
  const [status, setStatus] = useState<JobStatusResponse | null>(null);
  const [result, setResult] = useState<FinalBookPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const currentIntervalRef = useRef(pollInterval);
  
  // Stop polling
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);
  
  // Schedule the next poll with the current interval
  const scheduleNext = useCallback((fetchFn: () => void, interval: number) => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    intervalRef.current = setTimeout(fetchFn, interval);
  }, []);
  
  // Fetch status once
  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    
    try {
      const jobStatus = await getJobStatus(jobId);
      setStatus(jobStatus);
      setError(null);
      
      // Reset error counter on success
      consecutiveErrorsRef.current = 0;
      currentIntervalRef.current = pollInterval;
      
      // If completed, fetch result and stop polling
      if (jobStatus.status === 'completed') {
        try {
          const jobResult = await getJobResult(jobId);
          setResult(jobResult);
        } catch (e) {
          console.error('Failed to fetch result:', e);
        }
        stopPolling();
        return;
      }
      
      // If failed, stop polling
      if (jobStatus.status === 'failed') {
        setError(jobStatus.error || 'Job failed');
        stopPolling();
        return;
      }
      
      // Schedule next poll at normal interval
      scheduleNext(() => fetchStatus(), pollInterval);
      
    } catch (e) {
      consecutiveErrorsRef.current += 1;
      const errCount = consecutiveErrorsRef.current;
      
      if (errCount >= MAX_CONSECUTIVE_ERRORS) {
        // Too many consecutive errors - stop polling and report
        console.error(`Polling failed ${errCount} times consecutively, stopping.`);
        setError(
          e instanceof Error 
            ? `Connection lost: ${e.message}` 
            : 'Connection lost. The server may be unavailable.'
        );
        stopPolling();
        return;
      }
      
      // Exponential backoff: double the interval on each error, capped at MAX_POLL_INTERVAL
      const backoffInterval = Math.min(
        pollInterval * Math.pow(2, errCount),
        MAX_POLL_INTERVAL
      );
      currentIntervalRef.current = backoffInterval;
      
      console.warn(
        `Poll attempt ${errCount}/${MAX_CONSECUTIVE_ERRORS} failed, retrying in ${backoffInterval}ms`
      );
      
      // Schedule next poll with backoff
      scheduleNext(() => fetchStatus(), backoffInterval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, pollInterval, stopPolling, scheduleNext]);
  
  // Start polling
  const startPolling = useCallback(() => {
    if (!jobId || isPolling) return;
    
    setIsPolling(true);
    setError(null);
    consecutiveErrorsRef.current = 0;
    currentIntervalRef.current = pollInterval;
    
    // Fetch immediately
    fetchStatus();
  }, [jobId, pollInterval, isPolling, fetchStatus]);
  
  // Auto-start polling when jobId changes
  useEffect(() => {
    if (jobId) {
      startPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);
  
  return {
    status,
    result,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchStatus,
  };
}

/**
 * Hook for managing job creation state
 */
export function useJobCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  
  const reset = useCallback(() => {
    setIsCreating(false);
    setJobId(null);
    setCreateError(null);
  }, []);
  
  return {
    isCreating,
    setIsCreating,
    jobId,
    setJobId,
    createError,
    setCreateError,
    reset,
  };
}
