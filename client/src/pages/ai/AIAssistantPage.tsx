import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Bot, Send, AlertCircle } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { usePets } from '../../hooks/usePets';
import AIResultCard from '../../components/ai/AIResultCard';
import AIHistoryList from '../../components/ai/AIHistoryList';
import ImageUploader from '../../components/common/ImageUploader';
import type { AIAssistantSession, SessionStatus } from '../../types';

/**
 * AIAssistantPage — AI consultation interface.
 * Input: question + optional images + pet selection.
 * Output: question type, summary, sources, disclaimer.
 * Sidebar: consultation history.
 */
export default function AIAssistantPage() {
  const navigate = useNavigate();
  const { consult, isConsulting, currentResult, sessions, updateStatus } = useAI();
  const { pets, currentPet } = usePets();

  const [question, setQuestion] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<AIAssistantSession | null>(null);

  const handleConsult = async () => {
    if (question.trim().length < 5) return;
    const result = await consult({
      question: question.trim(),
      petId: currentPet?.id,
      imageUrls,
    });
    if (result) {
      setSelectedHistory(result);
    }
    setQuestion('');
    setImageUrls([]);
  };

  const displaySession = selectedHistory || currentResult;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Bot size={28} color="#FF8C42" />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            AI 助手
          </Typography>
          <Typography variant="caption" color="text.secondary">
            搜索社区 · 小红书 · 抖音 · AI 总结 · 仅供参考，不构成医疗诊断
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Input card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <TextField
                label="描述宠物问题"
                placeholder="如：狗狗今天突然呕吐了三次，精神不太好，该怎么办？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                fullWidth
                multiline
                rows={4}
                size="small"
                helperText={`${question.length}/1000 字`}
                inputProps={{ maxLength: 1000 }}
              />

              {/* Image upload */}
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  症状图片（可选，最多4张）
                </Typography>
                <ImageUploader images={imageUrls} onChange={setImageUrls} maxImages={4} label="上传图片" />
              </Box>

              {/* Pet selector info */}
              {currentPet && (
                <Box sx={{ mt: 1.5, p: 1, bgcolor: 'warm.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    关联宠物: {currentPet.name} ({currentPet.breed || '未知品种'})
                  </Typography>
                </Box>
              )}

              {/* Submit button */}
              <Button
                variant="contained"
                fullWidth
                startIcon={isConsulting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}
                onClick={handleConsult}
                disabled={isConsulting || question.trim().length < 5}
                sx={{ mt: 2 }}
              >
                {isConsulting ? 'AI 正在搜索...' : '搜索参考'}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          {displaySession && (
            <AIResultCard
              session={displaySession}
              onUpdateStatus={(sessionId, status) => updateStatus({ sessionId, status })}
              onAskCommunity={() => navigate('/?compose=true')}
            />
          )}

          {/* Loading hint */}
          {isConsulting && !displaySession && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} sx={{ color: 'primary.main', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  AI 正在搜索社区、小红书、抖音和网络信息...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  通常需要 10-30 秒
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Sidebar: history */}
        <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                咨询历史
              </Typography>
              <AIHistoryList
                sessions={sessions}
                onSelect={setSelectedHistory}
                selectedId={selectedHistory?.id}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
