
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, TrendingUp, Clock, User, Heart, Plus } from 'lucide-react';
// supabase removed for pure frontend
// AuthContext removed for pure frontend
import CreatePost from './CreatePost';
import PostView from './PostView';
// Toast removed for pure frontend

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  tags: string[];
  comments_count: number;
  likes_count: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  startups?: {
    name: string;
  } | null;
}

const ForumReal = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'latest' | 'trending'>('latest');
  // Pure frontend: fetchPosts uses mock data, no real-time subscription
const fetchPosts = () => {
  setIsLoading(true);
  setTimeout(() => {
    setPosts([
      {
        id: '1',
        title: 'Welcome to the Forum!',
        content: 'This is a mock post for the pure frontend version.',
        likes_count: 5,
        comments_count: 2,
        tags: ['startup', 'ecosystem'],
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Admin', avatar_url: '' },
        startups: { name: 'DemoStartup' },
        author_id: 'admin',
      },
    ]);
    setIsLoading(false);
  }, 500);
};

useEffect(() => {
  fetchPosts();
}, [filter]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Pure frontend: like increments likes in state
const handleLikePost = (postId: string) => {
  setPosts((prevPosts) =>
    prevPosts.map((post) =>
      post.id === postId
        ? { ...post, likes_count: (post.likes_count || 0) + 1 }
        : post
    )
  );
};

  if (selectedPost) {
    return (
      <PostView 
        post={{
          id: selectedPost.id,
          title: selectedPost.title,
          content: selectedPost.content,
          author: selectedPost.profiles.full_name || 'Anonymous',
          authorAvatar: selectedPost.profiles.avatar_url || undefined,
          tags: selectedPost.tags,
          commentsCount: selectedPost.comments_count,
          likes: selectedPost.likes_count,
          createdAt: selectedPost.created_at,
          startup: selectedPost.startups?.name
        }}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  if (showCreatePost) {
    return (
      <CreatePost 
        onBack={() => setShowCreatePost(false)}
        onPostCreated={() => {
          setShowCreatePost(false);
          fetchPosts();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground mt-2">
            Connect, share insights, and get support from the startup community
          </p>
        </div>
        <Button onClick={() => setShowCreatePost(true)} className="gap-2">
  <Plus className="h-4 w-4" />
  New Post
</Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'latest' ? 'default' : 'outline'}
          onClick={() => setFilter('latest')}
          className="gap-2"
        >
          <Clock className="h-4 w-4" />
          Latest
        </Button>
        <Button
          variant={filter === 'trending' ? 'default' : 'outline'}
          onClick={() => setFilter('trending')}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Trending
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to start a discussion!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles.avatar_url || undefined} />
                      <AvatarFallback className="gradient-bg text-white">
                        {(post.profiles.full_name || 'A').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.profiles.full_name || 'Anonymous'}</span>
                        {post.startups && (
                          <Badge variant="outline" className="text-xs">
                            @{post.startups.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div onClick={() => setSelectedPost(post)}>
                  <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikePost(post.id);
                    }}
                    className="gap-2 text-muted-foreground hover:text-red-600"
                    
                  >
                    <Heart className="h-4 w-4" />
                    {post.likes_count}
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments_count} comments
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ForumReal;
