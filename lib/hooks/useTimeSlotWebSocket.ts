import { useEffect, useRef, useCallback, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { TimeSlot } from '@/types';

interface UseTimeSlotWebSocketOptions {
  onUpdate?: (data: TimeSlotUpdate) => void;
  pollingInterval?: number; // Fallback polling interval in ms
}

interface TimeSlotUpdate {
  type: 'slots_update';
  date?: string;
  slot_id?: number;
  is_available?: boolean;
  current_bookings?: number;
  max_capacity?: number;
}

export function useTimeSlotWebSocket(options: UseTimeSlotWebSocketOptions = {}) {
  const { onUpdate, pollingInterval = 30000 } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [usePolling, setUsePolling] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (!wsUrl) {
      console.warn('WebSocket URL not configured, using polling fallback');
      setUsePolling(true);
      return;
    }

    try {
      const socket = io(wsUrl, {
        path: '/ws/timeslots/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setUsePolling(false);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setUsePolling(true);
      });

      socket.on('slots_update', (data: TimeSlotUpdate) => {
        if (onUpdate) {
          onUpdate(data);
        }
      });

      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setUsePolling(true);
    }
  }, [onUpdate]);

  // Polling fallback
  useEffect(() => {
    if (!usePolling) return;

    console.log('Using polling fallback for time slot updates');

    pollingIntervalRef.current = setInterval(async () => {
      try {
        // Fetch latest time slots
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/bookings/timeslots/available/`
        );
        const data = await response.json();

        if (onUpdate && data.success) {
          onUpdate({
            type: 'slots_update',
            ...data,
          });
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [usePolling, pollingInterval, onUpdate]);

  // Subscribe to updates for a specific date
  const subscribeToDate = useCallback((date: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe', { action: 'subscribe', date });
    }
  }, [isConnected]);

  return {
    isConnected,
    usePolling,
    subscribeToDate,
  };
}
