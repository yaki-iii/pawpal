import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HealthTimeline from '../components/health/HealthTimeline';
import type { HealthRecord } from '../types';
import { HealthRecordType } from '../types';

const createMockRecord = (overrides: Partial<HealthRecord> = {}): HealthRecord => ({
  id: 'record-1',
  petId: 'pet-1',
  type: HealthRecordType.VACCINE,
  date: '2026-06-01T00:00:00.000Z',
  itemName: '狂犬疫苗',
  notes: '第一针，无不良反应',
  images: ['/uploads/vaccine1.jpg'],
  createdAt: '2026-06-01T00:00:00.000Z',
  ...overrides,
});

describe('HealthTimeline', () => {
  it('should show empty state message when no records', () => {
    render(<HealthTimeline records={[]} />);

    expect(screen.getByText('暂无健康记录，点击上方按钮添加第一条记录')).toBeInTheDocument();
  });

  it('should render record item name', () => {
    const records = [createMockRecord()];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('狂犬疫苗')).toBeInTheDocument();
  });

  it('should render record notes', () => {
    const records = [createMockRecord()];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('第一针，无不良反应')).toBeInTheDocument();
  });

  it('should render type label for VACCINE', () => {
    const records = [createMockRecord({ type: HealthRecordType.VACCINE })];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('疫苗记录')).toBeInTheDocument();
  });

  it('should render type label for DEWORMING', () => {
    const records = [createMockRecord({
      type: HealthRecordType.DEWORMING,
      itemName: '体内驱虫药',
    })];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('驱虫记录')).toBeInTheDocument();
  });

  it('should render type label for CHECKUP', () => {
    const records = [createMockRecord({
      type: HealthRecordType.CHECKUP,
      itemName: '年度体检',
    })];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('体检记录')).toBeInTheDocument();
  });

  it('should render type label for VISIT', () => {
    const records = [createMockRecord({
      type: HealthRecordType.VISIT,
      itemName: '皮肤就诊',
    })];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('就诊记录')).toBeInTheDocument();
  });

  it('should render multiple records', () => {
    const records = [
      createMockRecord({ id: 'r1', itemName: '狂犬疫苗' }),
      createMockRecord({ id: 'r2', itemName: '驱虫药', type: HealthRecordType.DEWORMING }),
      createMockRecord({ id: 'r3', itemName: '年度体检', type: HealthRecordType.CHECKUP }),
    ];
    render(<HealthTimeline records={records} />);

    expect(screen.getByText('狂犬疫苗')).toBeInTheDocument();
    expect(screen.getByText('驱虫药')).toBeInTheDocument();
    expect(screen.getByText('年度体检')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    const records = [createMockRecord()];
    render(<HealthTimeline records={records} onDelete={onDelete} />);

    // Find the delete button (Trash2 icon)
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onDelete).toHaveBeenCalledWith('record-1');
  });

  it('should NOT show delete button when onDelete is not provided', () => {
    const records = [createMockRecord()];
    render(<HealthTimeline records={records} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render record images', () => {
    const records = [createMockRecord({ images: ['/uploads/img1.jpg', '/uploads/img2.jpg'] })];
    render(<HealthTimeline records={records} />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle record with no notes', () => {
    const records = [createMockRecord({ notes: '' })];
    render(<HealthTimeline records={records} />);

    // Should still render the item name
    expect(screen.getByText('狂犬疫苗')).toBeInTheDocument();
  });

  it('should render date in formatted form', () => {
    const records = [createMockRecord({ date: '2026-06-15T00:00:00.000Z' })];
    render(<HealthTimeline records={records} />);

    // date-fns formatDate should produce "2026-06-15"
    expect(screen.getByText('2026-06-15')).toBeInTheDocument();
  });
});
