import { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useFeed, usePostActions } from '../../hooks/usePosts';
import type { FeedType } from '../../types';
import PostCard from '../../components/community/PostCard';
import PostComposer from '../../components/community/PostComposer';
import InfiniteScrollList from '../../components/common/InfiniteScrollList';
import EmptyState from '../../components/common/EmptyState';
import { MessageSquare } from 'lucide-react';

const TABS: Array<{ label: string; value: FeedType }> = [
  { label: '推荐', value: 'RECOMMEND' },
  { label: '最新', value: 'LATEST' },
  { label: '关注', value: 'FOLLOWING' },
];

/**
 * FeedPage — community home page with feed tabs and post composer.
 */
export default function FeedPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const feedType = TABS[tabIndex].value;
  const { data, fetchNextPage, hasNextPage, isFetching, isLoading } = useFeed(feedType);
  const { createPost, deletePost, toggleLike } = usePostActions();

  const allPosts = data?.pages.flatMap((p) => p.items) || [];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        社区动态
      </Typography>

      {/* Post composer */}
      <PostComposer onPublish={createPost} />

      {/* Feed tabs */}
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} />
        ))}
      </Tabs>

      {/* Feed list */}
      <InfiniteScrollList
        items={allPosts}
        hasMore={!!hasNextPage}
        isLoading={isFetching}
        onLoadMore={() => fetchNextPage()}
        keyExtractor={(post) => post.id}
        emptyMessage={
          feedType === 'FOLLOWING'
            ? '关注的人还没有发布动态，去发现更多宠友吧！'
            : '暂无动态，快来发布第一条吧！'
        }
        renderItem={(post) => (
          <PostCard
            post={post}
            onLike={toggleLike}
            onDelete={deletePost}
          />
        )}
      />
    </Box>
  );
}
