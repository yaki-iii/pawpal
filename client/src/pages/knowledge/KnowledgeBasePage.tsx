import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import { Search, X, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { knowledgeApi } from '../../api/knowledge';
import EmptyState from '../../components/common/EmptyState';
import { SPECIES_LABELS } from '../../utils/constants';
import type { KnowledgeArticle, PetSpecies } from '../../types';

/**
 * KnowledgeBasePage — browse and search knowledge articles.
 * Filter by species and category. Search by keyword.
 */
export default function KnowledgeBasePage() {
  const [species, setSpecies] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['knowledge', species, keyword],
    queryFn: () =>
      keyword
        ? knowledgeApi.search(keyword, { species: species || undefined })
        : knowledgeApi.list({ species: species || undefined }),
  });

  const { data: categories } = useQuery({
    queryKey: ['knowledge-categories'],
    queryFn: () => knowledgeApi.getCategories(),
    staleTime: 30 * 60 * 1000,
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        养宠知识库
      </Typography>

      {/* Search */}
      <TextField
        placeholder="搜索知识文章..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color="#999" />
            </InputAdornment>
          ),
          endAdornment: keyword ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setKeyword('')}>
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Species filter */}
      <Tabs value={species} onChange={(_, v) => setSpecies(v)} sx={{ mb: 2 }}>
        <Tab label="全部" value="" />
        <Tab label="🐕 犬" value="DOG" />
        <Tab label="🐱 猫" value="CAT" />
      </Tabs>

      {/* Articles grid */}
      {isLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          加载中...
        </Typography>
      ) : (articles || []).length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} color="#FF8C42" />}
          title="暂无文章"
          description="试试其他关键词或筛选条件"
        />
      ) : (
        <Grid container spacing={2}>
          {(articles || []).map((article) => (
            <Grid item xs={12} sm={6} key={article.id}>
              <Card>
                <CardActionArea onClick={() => setSelectedArticle(article)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                      {article.species && (
                        <Chip
                          label={SPECIES_LABELS[article.species as PetSpecies]}
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      <Chip
                        label={article.category}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {article.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.75rem',
                      }}
                    >
                      {article.content.replace(/[#*]/g, '').substring(0, 100)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Article detail dialog */}
      <Dialog
        open={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedArticle && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              {selectedArticle.title}
              <IconButton
                onClick={() => setSelectedArticle(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <X size={20} />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                {selectedArticle.species && (
                  <Chip
                    label={SPECIES_LABELS[selectedArticle.species as PetSpecies]}
                    size="small"
                    color="primary"
                  />
                )}
                <Chip label={selectedArticle.category} size="small" variant="outlined" />
                <Chip label={selectedArticle.author} size="small" variant="outlined" />
              </Box>
              <Typography
                variant="body1"
                component="div"
                sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
              >
                {selectedArticle.content}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
