import React, { FC } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { trpc } from '../lib/trpc';

type Author = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
}

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

type Like = {
  id: string;
  authorId: string;
  postId: string;
}

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  comments: Comment[];
  likes: Like[];
  _count: {
    comments: number;
    likes: number;
  };
}

const PostCard: FC<{ post: Post; onLike: (postId: string) => void; currentUserId?: string }> = ({ 
  post, 
  onLike, 
  currentUserId 
}) => {
  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m`;
    } else {
      return 'now';
    }
  };

  const hasLiked = currentUserId ? post.likes.some(like => like.authorId === currentUserId) : false;

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor(post.author.username) }]}>
          <Text style={styles.avatarText}>
            {post.author.firstName[0]}{post.author.lastName[0]}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>
              {post.author.firstName} {post.author.lastName}
            </Text>
            <Text style={styles.username}>@{post.author.username}</Text>
            <Text style={styles.dateSeparator}>·</Text>
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post._count.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <Text style={[styles.actionIcon, hasLiked && styles.likedIcon]}>
            {hasLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionCount, hasLiked && styles.likedCount]}>
            {post._count.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getAvatarColor = (username: string) => {
  const colors = ['#1DA1F2', '#17BF63', '#F45D22', '#794BC4', '#E1306C', '#FD5949', '#1877F2'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const RenderPosts: React.FC = () => {
  const {
    data: feedData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.posts.getFeed.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const allPosts = feedData?.pages.flatMap((page) => page.posts) ?? [];
  const currentUserId = allPosts.length > 0 ? allPosts[0].author.id : undefined;

  const toggleLikeMutation = trpc.posts.toggleLike.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
    Alert.alert('Error', 'Could not process the like. Please try again.');
    },
  });

  const handleLike = (postId: string) => {
    if (!currentUserId) {
    Alert.alert('Error', 'Could not identify the user');
      return;
    }
    
    toggleLikeMutation.mutate({
      postId,
      authorId: currentUserId,
    });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard post={item} onLike={handleLike} currentUserId={currentUserId} />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#1DA1F2" />
          <Text style={styles.footerText}>Loading more posts...</Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts available</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error loading posts</Text>
      <Text style={styles.errorDescription}>{error.message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Try again</Text>
      </TouchableOpacity>
    </View>
    );
  }

  return (
    <FlatList
      data={allPosts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor="#1DA1F2"
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      style={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#E1E8ED',
    marginHorizontal: 0,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#14171A',
    marginRight: 4,
  },
  username: {
    color: '#657786',
    fontSize: 15,
    marginRight: 4,
  },
  dateSeparator: {
    color: '#657786',
    fontSize: 15,
    marginRight: 4,
  },
  date: {
    color: '#657786',
    fontSize: 15,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    color: '#14171A',
    marginBottom: 12,
    marginLeft: 52,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 52,
    marginRight: 80,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    minWidth: 48,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  actionCount: {
    fontSize: 13,
    color: '#657786',
    fontWeight: '400',
  },
  likedIcon: {
    color: '#F91880',
  },
  likedCount: {
    color: '#F91880',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#657786',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F91880',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorDescription: {
    fontSize: 14,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#657786',
  },
});

export default RenderPosts;