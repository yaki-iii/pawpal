import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AIResultCard from '../components/ai/AIResultCard';
import type { AIAssistantSession } from '../types';
import { SessionStatus } from '../types';

const DISCLAIMER = '以上内容来自社区和公开信息总结，仅供参考，不构成医疗诊断，复杂情况请及时就医。';

const createMockSession = (overrides: Partial<AIAssistantSession> = {}): AIAssistantSession => ({
  id: 'session-1',
  userId: 'user-1',
  petId: null,
  question: '我家柯基最近经常呕吐，精神也不太好，怎么办？',
  imageUrls: [],
  questionType: '消化问题',
  summary: '根据社区经验，柯基呕吐可能的原因有：\n1. 饮食问题\n2. 换粮过快\n3. 寄生虫感染',
  sources: [
    { type: 'post', title: '柯基呕吐经验分享', url: '/posts/p1', snippet: '我家柯基也经常呕吐...' },
    { type: 'article', title: '狗狗呕吐的原因和处理', url: '/knowledge/a1', snippet: '犬类呕吐常见原因...' },
  ],
  status: SessionStatus.OBSERVING,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
  ...overrides,
});

describe('AIResultCard', () => {
  it('should render question type tag', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('问题类型: 消化问题')).toBeInTheDocument();
  });

  it('should render the user question', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('你的问题')).toBeInTheDocument(); // "你的问题" label
    expect(screen.getByText('我家柯基最近经常呕吐，精神也不太好，怎么办？')).toBeInTheDocument();
  });

  it('should render the AI summary', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('参考建议')).toBeInTheDocument();
    expect(screen.getByText(/根据社区经验，柯基呕吐可能的原因有/)).toBeInTheDocument();
  });

  it('should render the disclaimer', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText(DISCLAIMER)).toBeInTheDocument();
  });

  it('should render source citations', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('来源引用')).toBeInTheDocument();
    expect(screen.getByText('柯基呕吐经验分享')).toBeInTheDocument();
    expect(screen.getByText('狗狗呕吐的原因和处理')).toBeInTheDocument();
  });

  it('should show "社区帖" label for post sources', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('社区帖')).toBeInTheDocument();
  });

  it('should show "知识文章" label for article sources', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('知识文章')).toBeInTheDocument();
  });

  it('should render status selector with all options', () => {
    const onUpdateStatus = vi.fn();
    render(<AIResultCard session={createMockSession()} onUpdateStatus={onUpdateStatus} />);

    expect(screen.getByText('观察中')).toBeInTheDocument();
    expect(screen.getByText('已恢复')).toBeInTheDocument();
    expect(screen.getByText('已就医')).toBeInTheDocument();
  });

  it('should highlight current status', () => {
    const onUpdateStatus = vi.fn();
    render(<AIResultCard session={createMockSession({ status: SessionStatus.RECOVERED })} onUpdateStatus={onUpdateStatus} />);

    // The "已恢复" chip should be filled (current status)
    const recoveredChip = screen.getByText('已恢复');
    expect(recoveredChip).toBeInTheDocument();
  });

  it('should call onUpdateStatus when status chip is clicked', () => {
    const onUpdateStatus = vi.fn();
    render(<AIResultCard session={createMockSession()} onUpdateStatus={onUpdateStatus} />);

    fireEvent.click(screen.getByText('已就医'));
    expect(onUpdateStatus).toHaveBeenCalledWith('session-1', SessionStatus.VISITED_DOCTOR);
  });

  it('should render "去社区提问" button when onAskCommunity is provided', () => {
    const onAskCommunity = vi.fn();
    render(<AIResultCard session={createMockSession()} onAskCommunity={onAskCommunity} />);

    expect(screen.getByText('去社区提问')).toBeInTheDocument();
  });

  it('should call onAskCommunity when button is clicked', () => {
    const onAskCommunity = vi.fn();
    render(<AIResultCard session={createMockSession()} onAskCommunity={onAskCommunity} />);

    fireEvent.click(screen.getByText('去社区提问'));
    expect(onAskCommunity).toHaveBeenCalled();
  });

  it('should NOT show status selector when onUpdateStatus is not provided', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.queryByText('后续状态:')).not.toBeInTheDocument();
  });

  it('should NOT show "去社区提问" button when onAskCommunity is not provided', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.queryByText('去社区提问')).not.toBeInTheDocument();
  });

  it('should handle session with no sources', () => {
    render(<AIResultCard session={createMockSession({ sources: [] })} />);

    expect(screen.queryByText('来源引用')).not.toBeInTheDocument();
  });

  it('should handle session with empty questionType', () => {
    render(<AIResultCard session={createMockSession({ questionType: '' })} />);

    // Should NOT render the question type chip
    expect(screen.queryByText(/问题类型:/)).not.toBeInTheDocument();
  });

  it('should handle session with empty summary', () => {
    render(<AIResultCard session={createMockSession({ summary: '' })} />);

    // Should NOT render the "参考建议" section
    expect(screen.queryByText('参考建议')).not.toBeInTheDocument();
  });

  it('should render source snippets', () => {
    render(<AIResultCard session={createMockSession()} />);

    expect(screen.getByText('我家柯基也经常呕吐...')).toBeInTheDocument();
    expect(screen.getByText('犬类呕吐常见原因...')).toBeInTheDocument();
  });
});
