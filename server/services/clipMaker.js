import { execFile } from 'child_process';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { getPlaybackUrl } from './brightcove.js';

const FFMPEG = process.env.FFMPEG_PATH || '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg';
const TMP_DIR = join(process.cwd(), 'tmp');

if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

/**
 * Generate a TikTok-ready vertical clip from a goal.
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

  // Build overlay text files
  const scorerName = (goal.scorerName || 'GOAL').toUpperCase();
  const goalDesc = buildGoalDescription(goal);
  const teamLine = 'SAN JOSE SHARKS';
  const scoreLine = buildScoreLine(goal);
  const statLine = buildStatLine(goal);

  const textFiles = {
    top1: join(TMP_DIR, `txt-top1-${goal.id}.txt`),
    top2: join(TMP_DIR, `txt-top2-${goal.id}.txt`),
    bot1: join(TMP_DIR, `txt-bot1-${goal.id}.txt`),
    bot2: join(TMP_DIR, `txt-bot2-${goal.id}.txt`),
    bot3: join(TMP_DIR, `txt-bot3-${goal.id}.txt`),
  };

  writeFileSync(textFiles.top1, scorerName);
  writeFileSync(textFiles.top2, goalDesc);
  writeFileSync(textFiles.bot1, teamLine);
  writeFileSync(textFiles.bot2, scoreLine);
  writeFileSync(textFiles.bot3, statLine);

  const outputFile = join(TMP_DIR, `tiktok-${goal.id}.mp4`);

  // Build FFmpeg filter
  const filterComplex = [
    '[0:v]crop=ih*9/16:ih,scale=1080:1920[v1]',
    '[v1]drawbox=y=0:w=iw:h=200:color=black@0.75:t=fill[v2]',
    '[v2]drawbox=y=ih-240:w=iw:h=240:color=black@0.75:t=fill[v3]',
    `[v3]drawtext=textfile=${textFiles.top1}:fontsize=54:fontcolor=white:x=(w-text_w)/2:y=35[v4]`,
    `[v4]drawtext=textfile=${textFiles.top2}:fontsize=32:fontcolor=cyan:x=(w-text_w)/2:y=105[v5]`,
    `[v5]drawtext=textfile=${textFiles.bot1}:fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h-210[v6]`,
    `[v6]drawtext=textfile=${textFiles.bot2}:fontsize=28:fontcolor=cyan:x=(w-text_w)/2:y=h-155[v7]`,
    `[v7]drawtext=textfile=${textFiles.bot3}:fontsize=24:fontcolor=orange:x=(w-text_w)/2:y=h-110[vout]`,
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

function buildGoalDescription(goal) {
  const parts = [];
  if (goal.goalType === 'PP') parts.push('POWER PLAY GOAL');
  else if (goal.goalType === 'SH') parts.push('SHORTHANDED GOAL');
  else if (goal.isGameWinning) parts.push('GAME WINNING GOAL');
  else if (goal.isOvertimeGoal) parts.push('OVERTIME GOAL');
  else if (goal.isEmptyNet) parts.push('EMPTY NET GOAL');
  else parts.push('GOAL');

  const period = goal.period <= 3 ? `${goal.period}${['st','nd','rd'][goal.period-1]} Period` : 'Overtime';
  parts.push(period);

  return parts.join(' | ');
}

function buildScoreLine(goal) {
  const game = goal.game;
  if (!game) return '';
  const date = new Date(game.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const sharksScore = game.isHome ? game.homeScore : game.awayScore;
  const oppScore = game.isHome ? game.awayScore : game.homeScore;
  return `SJS ${sharksScore} - ${oppScore} ${game.opponentAbbrev} | ${date}`;
}

function buildStatLine(goal) {
  const assists = [goal.assist1Name, goal.assist2Name].filter(Boolean);
  if (assists.length > 0) return `Assists: ${assists.join(', ')}`;
  return 'Unassisted';
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
 * Generate a TikTok caption with Claude
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

  // If Anthropic key is available, use Claude for a better caption
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return defaultCaption;

  try {
    const prompt = `Write a short, hype TikTok caption (under 150 chars before hashtags) for this NHL goal:
- ${goal.scorerName} scored for the San Jose Sharks
- ${goal.goalType === 'PP' ? 'Power play goal' : goal.isGameWinning ? 'Game-winning goal' : 'Goal'}
- Period ${goal.period}, time ${goal.periodTime}
- ${goal.shotType || 'shot'}
- ${assists.length > 0 ? `Assisted by ${assists.join(' and ')}` : 'Unassisted'}
- Game: Sharks vs ${game?.opponentAbbrev || 'opponent'} (${date})
- Score after goal: ${goal.homeScore}-${goal.awayScore}

Be energetic, use hockey slang. No emojis. End with relevant hashtags.`;

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
