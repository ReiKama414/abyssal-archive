import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CARDS_DIR = path.resolve('public/cards');
const PROGRESS_FILE = path.join(CARDS_DIR, 'GENERATION_PROGRESS.json');

const BATCH_SEQUENCE = [
  { name: 'abyss-later', label: '深海水族後續卡牌 (abyss-19 至 abyss-72)' },
  { name: 'nocturne-later', label: '幽夜幻想後續卡牌 (nocturne-18 至 nocturne-72)' },
  { name: 'neon-later', label: '霓虹異區後續卡牌 (neon-15 至 neon-72)' },
  { name: 'beast-later', label: '幻境靈獸後續卡牌 (beast-17 至 beast-72)' }
];

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(`執行指令: ${cmd} ${args.join(' ')}`);
    console.log(`======================================================\n`);

    const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
    p.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
    p.on('error', err => reject(err));
  });
}

async function waitForFestivals() {
  console.log('[Pipeline] 檢查節日卡牌生成進度...');
  while (true) {
    if (fs.existsSync(PROGRESS_FILE)) {
      try {
        const prog = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
        if (prog.status === 'completed' || prog.completed >= 99) {
          console.log('[Pipeline] 🎉 節日卡牌批次已全數完成！接續進行永久系列批次...');
          break;
        }
        console.log(`[Pipeline] 節日卡牌進度: ${prog.completed}/${prog.total} (${prog.percent}) - 目前: ${prog.currentCard?.name || ''}`);
      } catch {}
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}

async function main() {
  console.log('======================================================');
  console.log('   ABYSSAL ARCHIVE — 全系列自動連續生成流水線');
  console.log('======================================================\n');

  // Step 1: Wait for current festivals batch to complete
  await waitForFestivals();

  // Step 2: Run remaining series sequentially
  for (const batch of BATCH_SEQUENCE) {
    console.log(`\n>>> 開始執行批次: ${batch.label} (${batch.name})`);
    await runCommand('node', ['scripts/regenerate-comfyui-accurate.mjs', batch.name]);
    console.log(`>>> 完成批次: ${batch.label}！\n`);
  }

  // Step 3: Run comprehensive QA validation
  console.log('\n>>> 執行最終全方位 QA 驗證...');
  await runCommand('npx', ['tsx', 'scripts/qa-comprehensive.ts']);

  console.log('\n======================================================');
  console.log('🎉 所有卡牌精準中翻英生成與 QA 驗證全數大功告成！');
  console.log('======================================================\n');
}

main().catch(err => {
  console.error('[Pipeline Error]', err);
  process.exit(1);
});
