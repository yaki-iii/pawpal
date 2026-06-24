import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostCard from '../components/community/PostCard';
import { useAuthStore } from '../store/authStore';
import type { Post, User } from '../types';
import { MembershipLevel } from '../types';

// Helper: render with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

const mockUser: User = {
  id: 'user-1',
  email: 'author@example.com',
  nickname: '柯基麻麻',
  avatar: '',
  bio: '',
  city: '杭州',
  membershipLevel: MembershipLevel.FREE,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const mockPost: Post = {
  id: 'post-1',
  userId: 'user-1',
  circleId: null,
  petId: null,
  title: '柯基减肥记：3个月减了3公斤',
  content: '我家柯基煤球之前太胖了，经过3个月的努力终于减肥成功！分享下经验...',
  images: ['/uploads/img1.jpg', '/uploads/img2.jpg'],
  tags: ['柯基', '减肥', '健康'],
  likeCount: 42,
  commentCount: 15,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
  author: mockUser,
  isLiked: false,
};

describe('PostCard', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: mockUser,
      token: 'token',
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('should render post title', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('柯基减肥记：3个月减了3公斤')).toBeInTheDocument();
  });

  it('should render post content excerpt', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText(/我家柯基煤球之前太胖了/)).toBeInTheDocument();
  });

  it('should render author nickname', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('柯基麻麻')).toBeInTheDocument();
  });

  it('should render like count', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render comment count', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should render tags as #tag format', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('#柯基')).toBeInTheDocument();
    expect(screen.getByText('#减肥')).toBeInTheDocument();
    expect(screen.getByText('#健康')).toBeInTheDocument();
  });

  it('should render images', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    const images = screen.getAllByRole('img');
    // Should have 2 images from post + 1 avatar
    const postImages = images.filter((img) => img.getAttribute('src')?.includes('/uploads/'));
    expect(postImages.length).toBeGreaterThanOrEqual(2);
  });

  it('should call onLike when like button is clicked', () => {
    const onLike = vi.fn();
    renderWithRouter(<PostCard post={mockPost} onLike={onLike} />);

    // Find the like button (contains the heart icon and count)
    const likeButton = screen.getByText('42').closest('button');
    expect(likeButton).toBeDefined();

    fireEvent.click(likeButton!);
    expect(onLike).toHaveBeenCalledWith('post-1');
  });

  it('should show delete button when user is the author and onDelete is provided', () => {
    const onDelete = vi.fn();
    renderWithRouter(<PostCard post={mockPost} onDelete={onDelete} />);

    // Delete button should exist (Trash2 icon button)
    const buttons = screen.getAllByRole('button');
    // The delete button should be present
    expect(buttons.length).toBeGreaterThanOrEqual(3); // card click, like, comment, delete
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    renderWithRouter(<PostCard post={mockPost} onDelete={onDelete} />);

    // Find and click the delete button
    // The delete button is in CardContent (before CardActions), so it's the first button
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[0];
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith('post-1');
  });

  it('should NOT show delete button when user is not the author', () => {
    useAuthStore.setState({
      user: { ...mockUser, id: 'different-user' },
      token: 'token',
      isAuthenticated: true,
      isLoading: false,
    });

    const onDelete = vi.fn();
    renderWithRouter(<PostCard post={mockPost} onDelete={onDelete} />);

    // Should only have 2 action buttons (like + comment), no delete
    const actionButtons = screen.getAllByRole('button');
    expect(actionButtons.length).toBe(2);
  });

  it('should render "未知用户" when author is not provided', () => {
    const postWithoutAuthor: Post = {
      ...mockPost,
      author: undefined,
    };
    renderWithRouter(<PostCard post={postWithoutAuthor} />);
    expect(screen.getByText('未知用户')).toBeInTheDocument();
  });

  it('should handle post with no images', () => {
    const postWithoutImages: Post = {
      ...mockPost,
      images: [],
    };
    renderWithRouter(<PostCard post={postWithoutImages} />);
    // Should still render title and content
    expect(screen.getByText('柯基减肥记：3个月减了3公斤')).toBeInTheDocument();
  });

  it('should handle post with no tags', () => {
    const postWithoutTags: Post = {
      ...mockPost,
      tags: [],
    };
    renderWithRouter(<PostCard post={postWithoutTags} />);
    // Should not render any # tags
    expect(screen.queryByText('#柯基')).not.toBeInTheDocument();
  });
});
