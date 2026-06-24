import { useCallback, useRef, type ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface InfiniteScrollListProps<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}

/**
 * InfiniteScrollList — generic infinite scroll container.
 * Uses IntersectionObserver to detect when user scrolls near the bottom.
 */
export default function InfiniteScrollList<T>({
  items,
  hasMore,
  isLoading,
  onLoadMore,
  renderItem,
  emptyMessage = '暂无内容',
  keyExtractor,
}: InfiniteScrollListProps<T>) {
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { rootMargin: '100px' },
      );

      if (node) observer.current.observe(node);
      sentinelRef.current = node;
    },
    [isLoading, hasMore, onLoadMore],
  );

  if (items.length === 0 && !isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {items.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}

      {/* Sentinel for infinite scroll */}
      {hasMore && (
        <div ref={lastElementRef} style={{ height: 1 }} />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={24} sx={{ color: 'primary.main' }} />
        </Box>
      )}

      {/* End message */}
      {!hasMore && items.length > 0 && (
        <Box sx={{ py: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            — 已经到底了 —
          </Typography>
        </Box>
      )}
    </Box>
  );
}
