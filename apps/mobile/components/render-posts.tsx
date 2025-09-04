import React from 'react';
import {
  View,
  Text,
  FlatList,
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

const PostCard = ({ 
  post, 
  onLike, 
  currentUserId 
}: { post: Post; onLike: (postId: string) => void; currentUserId?: string }) => {
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
    <View className="bg-white px-4 py-3">
      <View className="flex-row items-start mb-2">
        <View 
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          style={{ backgroundColor: getAvatarColor(post.author.username) }}
        >
          <Text className="text-white font-bold text-sm">
            {post.author.firstName[0]}{post.author.lastName[0]}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap">
            <Text className="font-bold text-base text-black mr-1">
              {post.author.firstName} {post.author.lastName}
            </Text>
            <Text className="text-gray-500 text-base mr-1">@{post.author.username}</Text>
            <Text className="text-gray-500 text-base mr-1">·</Text>
            <Text className="text-gray-500 text-base">{formatDate(post.createdAt)}</Text>
          </View>
        </View>
      </View>

      <Text className="text-base leading-5 text-black mb-3 ml-13">
        {post.content}
      </Text>

      <View className="flex-row justify-between ml-13 mr-20 mt-2">
        <TouchableOpacity className="flex-row items-center p-2 rounded-full min-w-12">
          <Text className="text-lg mr-1">💬</Text>
          <Text className="text-xs text-gray-500 font-normal">{post._count.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center p-2 rounded-full min-w-12"
          onPress={() => onLike(post.id)}
        >
          <Text className={`text-lg mr-1 ${hasLiked ? 'text-pink-500' : ''}`}>
            {hasLiked ? '❤️' : '🤍'}
          </Text>
          <Text className={`text-xs font-normal ${hasLiked ? 'text-pink-500' : 'text-gray-500'}`}>
            {post._count.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-2 rounded-full min-w-12">
          <Text className="text-lg mr-1">🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-2 rounded-full min-w-12">
          <Text className="text-lg mr-1">📤</Text>
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

const RenderPosts = () => {
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

  const renderFooter = () => isFetchingNextPage ? (
    <View className="flex-row justify-center items-center p-5">
      <ActivityIndicator size="small" color="#1DA1F2" />
      <Text className="ml-2 text-sm text-gray-500">Loading more posts...</Text>
    </View>
  ) : null;

  const renderEmpty = () => (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-base text-gray-500 text-center mb-5">No posts available</Text>
      <TouchableOpacity 
        className="bg-blue-500 px-5 py-2 rounded-full" 
        onPress={() => refetch()}
      >
        <Text className="text-white font-bold text-base">Try again</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
        <Text className="mt-2 text-base text-gray-500">Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <Text className="text-lg font-bold text-pink-500 text-center mb-2">
          Error loading posts
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-5">{error.message}</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-5 py-2 rounded-full" 
          onPress={() => refetch()}
        >
          <Text className="text-white font-bold text-base">Try again</Text>
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
      className="flex-1 bg-white"
      ItemSeparatorComponent={() => <View className="h-px bg-gray-200" />}
    />
  );
};

export default RenderPosts;