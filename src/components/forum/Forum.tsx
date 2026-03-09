import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageSquare, Clock, TrendingUp, User } from 'lucide-react';
import CreatePost from './CreatePost';
import PostView from './PostView';
import { useAuth } from '@/contexts/AuthContext';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  commentsCount: number;
  likes: number;
  createdAt: string;
  startup?: string;
}

const Forum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/forum/posts?sort=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data.map((p: any) => ({
          id: p._id,
          title: p.title,
          content: p.content,
          author: p.author?.fullName || 'Anonymous',
          authorAvatar: p.author?.avatarUrl,
          tags: p.tags || [],
          commentsCount: p.commentsCount || 0,
          likes: p.likesCount || 0,
          createdAt: p.createdAt,
          startup: p.startup,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPosts();
  }, [token, sortBy]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const sortedPosts = [...posts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'most-commented':
        return b.commentsCount - a.commentsCount;
      case 'trending':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchPosts();
  };

  if (showCreatePost) {
    return <CreatePost onBack={() => setShowCreatePost(false)} onPostCreated={handlePostCreated} />;
  }

  if (selectedPost) {
    return <PostView post={selectedPost} onBack={() => setSelectedPost(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Forum</h2>
          <p className="text-muted-foreground">Connect and share with fellow entrepreneurs</p>
        </div>
        <Button onClick={() => setShowCreatePost(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-commented">Most Commented</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">{posts.length} posts</p>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          sortedPosts.map((post) => (
            <Card key={post.id} className="hover-lift cursor-pointer transition-all duration-200" onClick={() => setSelectedPost(post)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                        {post.startup && <span className="text-primary">@{post.startup}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{post.commentsCount} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{post.likes} likes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
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

export default Forum;
