/**
 * Rank-Based Prediction Engine
 * Reusable logic for standalone page, chatbot, and profile widget.
 */

export const PREDICTION_LEVELS = {
  SAFE: { label: 'Safe', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', emoji: '🟢', confidence: 'High' },
  MODERATE: { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', emoji: '🟡', confidence: 'Medium' },
  RISKY: { label: 'Risky', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', emoji: '🔴', confidence: 'Low' },
  OPEN: { label: 'Open', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', emoji: '⚪', confidence: 'N/A' },
};

/**
 * Categorizes a user's chance for a college based on cutoff data.
 */
export function categorizePrediction(college, examId, userValue) {
  if (!userValue || isNaN(userValue)) return PREDICTION_LEVELS.OPEN;
  
  const cutoffs = college.cutoffs;
  if (!cutoffs || !Array.isArray(cutoffs) || cutoffs.length === 0) {
    return PREDICTION_LEVELS.OPEN;
  }

  // Find the relevant cutoff for the selected exam
  // normalize names: "JEE Main", "NEET", etc.
  const cut = cutoffs.find(c => 
    c.exam?.toLowerCase().replace(/\s/g, '_') === examId || 
    c.exam?.toLowerCase().replace(/\s/g, '') === examId.replace(/_/g, '')
  );

  if (!cut) return PREDICTION_LEVELS.OPEN;

  const score = parseFloat(userValue);

  // JEE Advanced (Rank-based)
  // Lower rank = better. 
  // Safe: Rank <= 80% of Max Rank
  // Moderate: Rank <= 105% of Max Rank
  // Risky: Rank > 105% of Max Rank
  if (examId === 'jee_advanced') {
    const maxRank = cut.max_rank || cut.rank || cut.cutoff;
    if (!maxRank) return PREDICTION_LEVELS.OPEN;
    
    if (score <= maxRank * 0.8) return PREDICTION_LEVELS.SAFE;
    if (score <= maxRank * 1.05) return PREDICTION_LEVELS.MODERATE;
    return PREDICTION_LEVELS.RISKY;
  }

  // Score-based (NEET, JEE Main %, CAT %, etc.)
  // Higher score = better.
  // Safe: Score >= 110% of Min Score
  // Moderate: Score >= 92% of Min Score
  // Risky: Score < 92% of Min Score
  const minScore = cut.min_score || cut.score || cut.cutoff;
  if (!minScore) return PREDICTION_LEVELS.OPEN;

  if (score >= minScore * 1.1) return PREDICTION_LEVELS.SAFE;
  if (score >= minScore * 0.92) return PREDICTION_LEVELS.MODERATE;
  return PREDICTION_LEVELS.RISKY;
}

/**
 * Usage Limits
 */
const STORAGE_KEY = 'edu_predictor_usage';
const PREMIUM_DAILY_LIMIT = 5;

export function getUsage() {
  const today = new Date().toDateString();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { date: today, count: 0 };
  
  const data = JSON.parse(raw);
  if (data.date !== today) return { date: today, count: 0 };
  
  return data;
}

export function recordUsage() {
  const usage = getUsage();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function canUserPredict(role) {
  if (role === 'pro') return true;
  if (role === 'premium') {
    const usage = getUsage();
    return usage.count < PREMIUM_DAILY_LIMIT;
  }
  return false; // Guests/Free handled by UI gate
}
