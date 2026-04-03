import { execFile } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getPlaybackUrl } from './brightcove.js';

const FFMPEG = process.env.FFMPEG_PATH || '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg';
const TMP_DIR = join(process.cwd(), 'tmp');

if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

/**
 * Generate a TikTok-ready vertical clip from a goal.
 * Uses Claude for dramatic overlay text when available.
 * Returns the path to the output MP4 file.
 */
export async function makeVerticalClip(goal, options = {}) {
  const {
    maxDuration = 30,
    bitrate = '5M',
  } = options;

  if (!goal.brightcoveId) throw new Error('Goal has no video clip');

  // Resolve the source MP4
  const playback = await getPlaybackUrl(goal.brightcoveId);
  const sourceUrl = playback.url;

  // Download source
  const sourceFile = join(TMP_DIR, `source-${goal.id}.mp4`);
  const res = await fetch(sourceUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(sourceFile, buffer);

  // Generate overlay text (Claude if available, fallback to template)
  const overlay = await generateOverlayText(goal);

  const textFiles = {
    top1: join(TMP_DIR, `txt-top1-${goal.id}.txt`),
    top2: join(TMP_DIR, `txt-top2-${goal.id}.txt`),
    bot1: join(TMP_DIR, `txt-bot1-${goal.id}.txt`),
    bot2: join(TMP_DIR, `txt-bot2-${goal.id}.txt`),
    bot3: join(TMP_DIR, `txt-bot3-${goal.id}.txt`),
  };

  writeFileSync(textFiles.top1, overlay.headline);
  writeFileSync(textFiles.top2, overlay.subline);
  writeFileSync(textFiles.bot1, overlay.bottomMain);
  writeFileSync(textFiles.bot2, overlay.bottomSub);
  writeFileSync(textFiles.bot3, overlay.hashtags.split(' ').slice(0, 3).join(' '));

  const outputFile = join(TMP_DIR, `tiktok-${goal.id}.mp4`);

  // Build FFmpeg filter — headline gets dynamic font size based on length
  const headlineFontSize = overlay.headline.length > 35 ? 36 : overlay.headline.length > 25 ? 44 : 54;

  const filterComplex = [
    '[0:v]crop=ih*9/16:ih,scale=1080:1920[v1]',
    '[v1]drawbox=y=0:w=iw:h=220:color=black@0.8:t=fill[v2]',
    '[v2]drawbox=y=ih-260:w=iw:h=260:color=black@0.8:t=fill[v3]',
    `[v3]drawtext=textfile=${textFiles.top1}:fontsize=${headlineFontSize}:fontcolor=white:x=(w-text_w)/2:y=30[v4]`,
    `[v4]drawtext=textfile=${textFiles.top2}:fontsize=28:fontcolor=cyan:x=(w-text_w)/2:y=${30 + headlineFontSize + 15}[v5]`,
    `[v5]drawtext=textfile=${textFiles.bot1}:fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h-230[v6]`,
    `[v6]drawtext=textfile=${textFiles.bot2}:fontsize=26:fontcolor=cyan:x=(w-text_w)/2:y=h-175[v7]`,
    `[v7]drawtext=textfile=${textFiles.bot3}:fontsize=22:fontcolor=orange:x=(w-text_w)/2:y=h-135[vout]`,
  ].join('; ');

  await runFfmpeg([
    '-i', sourceFile,
    '-filter_complex', filterComplex,
    '-map', '[vout]', '-map', '0:a',
    '-c:v', 'libx264', '-b:v', bitrate,
    '-c:a', 'aac', '-b:a', '128k',
    '-t', String(maxDuration),
    '-y', outputFile,
  ]);

  // Clean up temp files
  try {
    unlinkSync(sourceFile);
    Object.values(textFiles).forEach(f => unlinkSync(f));
  } catch {}

  return outputFile;
}

/**
 * Generate dramatic overlay text using Claude.
 * Falls back to template if no API key.
 */
async function generateOverlayText(goal) {
  const game = goal.game;
  const assists = [goal.assist1Name, goal.assist2Name].filter(Boolean);
  const date = game ? new Date(game.gameDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const sharksScore = game?.isHome ? game.homeScore : game?.awayScore;
  const oppScore = game?.isHome ? game.awayScore : game?.homeScore;

  // Fallback overlay
  const fallback = {
    headline: (goal.scorerName || 'GOAL').toUpperCase(),
    subline: buildFallbackSubline(goal),
    bottomMain: `SHARKS ${sharksScore || ''} - ${oppScore || ''} ${game?.opponentAbbrev || ''}`,
    bottomSub: date,
    hashtags: `#SJSharks #NHL #Hockey #${(goal.scorerName || '').replace(/\s/g, '')}`,
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallback;

  try {
    const goalContext = [];
    if (goal.goalType === 'PP') goalContext.push('Power play goal');
    if (goal.isGameWinning) goalContext.push('Game-winning goal');
    if (goal.isOvertimeGoal) goalContext.push('Overtime goal');
    if (goal.isEmptyNet) goalContext.push('Empty net goal');

    // Get season stats for extra context
    const seasonGoals = goal.scorer?.seasonStats?.goals || '';

    const prompt = `Generate overlay text for a TikTok hockey highlight clip. Return ONLY a valid JSON object with these 5 fields, no markdown, no backticks:

{"headline":"(8-40 chars, ALL CAPS, dramatic SportsCenter headline — make it vivid and specific to the play, not generic)","subline":"(period, time, shot type, assists — factual)","bottomMain":"(SHARKS score - opponent score OPPONENT)","bottomSub":"(date + one killer stat like goal count or streak)","hashtags":"(5-7 hashtags)"}

Goal data:
- Scorer: ${goal.scorerName}
- ${goalContext.length > 0 ? goalContext.join(', ') : 'Even strength goal'}
- Period ${goal.period}, time ${goal.periodTime}
- Shot: ${goal.shotType || 'shot'}
- Assists: ${assists.length > 0 ? assists.join(', ') : 'Unassisted'}
- Score after this goal: SJS ${goal.homeScore}-${goal.awayScore} ${game?.opponentAbbrev || ''}
- Final score: SJS ${sharksScore}-${oppScore} ${game?.opponentAbbrev || ''}
- ${seasonGoals ? `This was goal #${seasonGoals} on the season` : ''}
- Date: ${date}
- ${goal.period === 3 && goal.periodTime > '15:00' ? 'LATE IN THE 3RD PERIOD' : ''}
- ${goal.isGameWinning ? 'THIS WAS THE GAME-WINNING GOAL' : ''}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    // Parse JSON from response (strip markdown code blocks if present)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      headline: (parsed.headline || fallback.headline).substring(0, 50),
      subline: parsed.subline || fallback.subline,
      bottomMain: parsed.bottomMain || fallback.bottomMain,
      bottomSub: parsed.bottomSub || fallback.bottomSub,
      hashtags: parsed.hashtags || fallback.hashtags,
    };
  } catch (err) {
    console.warn('[clip-maker] Claude overlay generation failed, using fallback:', err.message);
    return fallback;
  }
}

function buildFallbackSubline(goal) {
  const parts = [];
  if (goal.goalType === 'PP') parts.push('PPG');
  else if (goal.goalType === 'SH') parts.push('SHG');

  const period = goal.period <= 3 ? `P${goal.period}` : 'OT';
  parts.push(`${period} ${goal.periodTime}`);

  if (goal.shotType) parts.push(goal.shotType);

  const assists = [goal.assist1Name, goal.assist2Name].filter(Boolean);
  if (assists.length > 0) parts.push(`from ${assists.join(', ')}`);

  return parts.join(' | ');
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile(FFMPEG, args, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[ffmpeg] Error:', stderr);
        reject(new Error(`FFmpeg failed: ${err.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

/**
 * Generate a TikTok post caption with Claude
 */
export async function generateCaption(goal) {
  const game = goal.game;
  const date = game ? new Date(game.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const assists = [goal.assist1Name, goal.assist2Name].filter(Boolean);

  const defaultCaption = [
    goal.scorerName,
    goal.goalType === 'PP' ? 'PPG' : goal.isGameWinning ? 'GWG' : 'goal',
    game ? `vs ${game.opponentAbbrev}` : '',
    date ? `(${date})` : '',
    assists.length > 0 ? `| Assists: ${assists.join(', ')}` : '',
    '',
    '#SanJoseSharks #NHL #Hockey #SJSharks',
    `#${goal.scorerName.replace(/\s/g, '')}`,
    goal.isGameWinning ? '#GameWinner' : '',
    goal.goalType === 'PP' ? '#PowerPlay' : '',
  ].filter(Boolean).join(' ');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return defaultCaption;

  try {
    const prompt = `Write a TikTok caption for this NHL goal highlight. Keep it under 200 chars before hashtags. Sound like a hype hockey fan account — punchy, confident, uses hockey slang. No emojis.

- ${goal.scorerName} scored for the San Jose Sharks
- ${goal.goalType === 'PP' ? 'Power play goal' : goal.isGameWinning ? 'Game-winning goal' : 'Goal'}
- Period ${goal.period}, ${goal.periodTime}
- ${goal.shotType || 'shot'}
- ${assists.length > 0 ? `Assisted by ${assists.join(' and ')}` : 'Unassisted'}
- Sharks vs ${game?.opponentAbbrev || 'opponent'} (${date})
- Score: ${goal.homeScore}-${goal.awayScore}

End with 5-7 relevant hashtags. Return ONLY the caption text, nothing else.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await res.json();
    return data.content?.[0]?.text || defaultCaption;
  } catch {
    return defaultCaption;
  }
}
