
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, MessageSquare, TrendingUp, Clock, User, Heart, Reply } from 'lucide-react';
import CommentThread from './CommentThread';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

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

interface PostViewProps {
  post: ForumPost;
  onBack: () => void;
}

const PostView = ({ post, onBack }: PostViewProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isLoading, setIsLoading] = useState(true);

  // Mock comments data
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'Great question! In my experience, the key is to focus on the problem you\'re solving and the market size. Investors want to see traction and a clear path to revenue.',
        author: 'Alex Kumar',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 5,
        replies: [
          {
            id: '1-1',
            content: 'Absolutely agree! Also, make sure to have a solid financial model and know your numbers inside out.',
            author: 'Jessica Park',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            likes: 2,
            replies: []
          }
        ]
      },
      {
        id: '2',
        content: 'I would add that having a strong team slide is crucial. Investors invest in people as much as they invest in ideas.',
        author: 'David Chen',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        replies: []
      }
    ];

    setTimeout(() => {
      setComments(mockComments);
      setIsLoading(false);
    }, 800);
  }, []);

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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleAddComment = (content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: 'Current User',
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };
    setComments([newComment, ...comments]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Forum
        </Button>
      </div>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback className="gradient-bg text-white">
                  {post.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.author}</span>
                  {post.startup && <Badge variant="outline" className="text-xs">@{post.startup}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          {/* Post Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-6 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${isLiked ? 'text-red-600' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {comments.length} comments
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <CommentThread 
        comments={comments} 
        onAddComment={handleAddComment}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PostView;
