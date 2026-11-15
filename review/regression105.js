async (page) => {
  await page.goto('http://127.0.0.1:4338/GH-Arcade/games/stack/');
  await page.waitForFunction(() => window.game?.scene.getScenes(true).some(s => s.sys.settings.key === 'Menu'));
  await page.evaluate(() => localStorage.removeItem('gh-arcade:settings'));
  await page.reload();
  await page.waitForFunction(() => window.game?.scene.getScenes(true).some(s => s.sys.settings.key === 'Menu'));
  await page.keyboard.press('Enter', { delay: 80 });
  await page.waitForFunction(() => window.game.scene.getScenes(true).some(s => s.sys.settings.key === 'Game'));
  await page.keyboard.press('p', { delay: 80 });
  await page.keyboard.press('ArrowDown', { delay: 80 });
  await page.keyboard.press('ArrowDown', { delay: 80 });
  await page.keyboard.press('Enter', { delay: 80 });
  const read = () => page.evaluate(() => {
    const walk = objects => objects.flatMap(o => o.visible === false ? [] : [o.text, ...(o.list ? walk(o.list) : [])]).filter(t => typeof t === 'string');
    return walk(window.game.scene.getScene('Game').children.list);
  });
  if (!(await read()).includes('SOUND  ON')) throw new Error('settings did not start with sound on');
  await page.keyboard.press('m', { delay: 80 });
  const muted = await read();
  if (!muted.includes('SOUND  OFF') || !muted.includes('MUTED (M)')) throw new Error('mute labels disagree: ' + JSON.stringify(muted));
  await page.screenshot({ path: 'output/playwright/issue105-after-mute.png' });
  await page.keyboard.press('m', { delay: 80 });
  const audible = await read();
  if (!audible.includes('SOUND  ON') || audible.includes('MUTED (M)')) throw new Error('unmute labels disagree: ' + JSON.stringify(audible));
  console.log(JSON.stringify({ mute: 'SOUND OFF and MUTED (M)', unmute: 'SOUND ON and no muted indicator' }));
}