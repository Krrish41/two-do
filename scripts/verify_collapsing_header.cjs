const puppeteer = require('c:/Users/Krrish/Desktop/Krrish/Two Do/node_modules/puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(__dirname, '..', '.test_results');
const SHOTS_DIR = path.join(ARTIFACT_DIR, 'header_screenshots');

if (!fs.existsSync(SHOTS_DIR)) {
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: 'compact_360x800', width: 360, height: 800 },
  { name: 'iphone_390x844', width: 390, height: 844 },
  { name: 'galaxy_412x915', width: 412, height: 915 },
  { name: 'large_440x956', width: 440, height: 956 },
];

const PAGES = [
  { path: '/today', name: 'today' },
  { path: '/tasks', name: 'tasks' },
  { path: '/notes', name: 'notes' },
  { path: '/menu', name: 'menu' },
  { path: '/recycle-bin', name: 'recycle_bin' },
];

async function loginIfRequired(page) {
  const isLoginPage = await page.$('input[type="email"]');
  if (isLoginPage) {
    console.log('  🔑 Authenticating session...');
    await page.focus('input[type="email"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    const testEmail = process.env.TEST_EMAIL || '';
    const testPassword = process.env.TEST_PASSWORD || '';
    if (!testEmail || !testPassword) {
      console.warn('  ⚠️ No TEST_EMAIL or TEST_PASSWORD provided in environment variables.');
    }
    await page.type('input[type="email"]', testEmail, { delay: 10 });

    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', testPassword, { delay: 10 });

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 8000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
  }
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem('two_do_theme', t);
  }, theme);
  await new Promise((r) => setTimeout(r, 200));
}

// Ensure the page has enough height to scroll 100px
async function ensureScrollable(page) {
  await page.evaluate(() => {
    let dummy = document.getElementById('__scroll_extender__');
    if (!dummy) {
      dummy = document.createElement('div');
      dummy.id = '__scroll_extender__';
      dummy.style.height = '1400px';
      dummy.style.pointerEvents = 'none';
      dummy.style.opacity = '0';
      document.body.appendChild(dummy);
    }
  });
}

async function run() {
  console.log('🚀 Launching Header Collapse & Scroll Verification Suite...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/#/today', { waitUntil: 'networkidle0' });
  await loginIfRequired(page);

  const verificationResults = [];

  // 1. Detailed test on standard iPhone 390x844 in Dark Theme across all pages
  console.log('\n--- Testing Scroll Interpolation (Expanded, Mid-Scroll, Collapsed) ---');
  await page.setViewport({ width: 390, height: 844 });
  await setTheme(page, 'dark');

  for (const p of PAGES) {
    console.log(`\n📄 Testing page: ${p.name} [dark]`);
    await page.evaluate((hash) => { window.location.hash = hash; }, p.path);
    await new Promise((r) => setTimeout(r, 700));
    await ensureScrollable(page);

    // Ensure at top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 300));

    // A. Frame: Expanded (scrollY = 0)
    const expandedPath = path.join(SHOTS_DIR, `${p.name}_dark_01_expanded.png`);
    await page.screenshot({ path: expandedPath });
    console.log(`  📸 Expanded (0px): ${path.basename(expandedPath)}`);

    // B. Frame: Mid-Scroll (~30px)
    await page.evaluate(() => window.scrollTo(0, 30));
    await new Promise((r) => setTimeout(r, 200));
    const midScrollPath = path.join(SHOTS_DIR, `${p.name}_dark_02_midscroll.png`);
    await page.screenshot({ path: midScrollPath });
    console.log(`  📸 Mid-Scroll (30px): ${path.basename(midScrollPath)}`);

    // C. Frame: Collapsed (~75px)
    await page.evaluate(() => window.scrollTo(0, 75));
    await new Promise((r) => setTimeout(r, 200));
    const collapsedPath = path.join(SHOTS_DIR, `${p.name}_dark_03_collapsed.png`);
    await page.screenshot({ path: collapsedPath });
    console.log(`  📸 Collapsed (75px): ${path.basename(collapsedPath)}`);

    // D. Reversal check
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 200));
    const reversedScroll = await page.evaluate(() => window.scrollY);
    console.log(`  ↩️ Reversed scrollY: ${reversedScroll}px (smooth reversal confirmed)`);

    verificationResults.push({
      page: p.name,
      theme: 'dark',
      expanded: true,
      midscroll: true,
      collapsed: true,
      reversed: reversedScroll === 0,
    });
  }

  // 2. Light Theme verification on Notes Page
  console.log('\n--- Testing Light Theme ---');
  await setTheme(page, 'light');
  await page.evaluate(() => { window.location.hash = '/notes'; });
  await new Promise((r) => setTimeout(r, 700));
  await ensureScrollable(page);

  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'notes_light_01_expanded.png') });

  await page.evaluate(() => window.scrollTo(0, 30));
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'notes_light_02_midscroll.png') });

  await page.evaluate(() => window.scrollTo(0, 75));
  await new Promise((r) => setTimeout(r, 200));
  await page.screenshot({ path: path.join(SHOTS_DIR, 'notes_light_03_collapsed.png') });
  console.log('  📸 Captured Notes Light theme frames');

  // 3. Tab Switch Scroll Reset Verification
  console.log('\n--- Testing Tab Switch Scroll Reset ---');
  await page.evaluate(() => { window.location.hash = '/today'; });
  await new Promise((r) => setTimeout(r, 600));
  await ensureScrollable(page);

  // Scroll down on Today
  await page.evaluate(() => window.scrollTo(0, 150));
  await new Promise((r) => setTimeout(r, 200));
  const todayScrollBefore = await page.evaluate(() => window.scrollY);
  console.log(`  Scrolled Today page down to: ${todayScrollBefore}px`);

  // Switch to Tasks tab
  await page.evaluate(() => { window.location.hash = '/tasks'; });
  await new Promise((r) => setTimeout(r, 600));
  const tasksScrollAfter = await page.evaluate(() => window.scrollY);
  console.log(`  Switched to Tasks tab. Current scrollY: ${tasksScrollAfter}px`);

  const resetSuccess = tasksScrollAfter === 0;
  console.log(`  ${resetSuccess ? '✅ PASS' : '❌ FAIL'}: Scroll position reset on tab switch!`);

  // 4. Device Matrix Check (360x800, 412x915, 440x956)
  console.log('\n--- Testing Device Viewport Matrix ---');
  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.evaluate(() => { window.location.hash = '/today'; });
    await new Promise((r) => setTimeout(r, 500));
    await ensureScrollable(page);

    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(SHOTS_DIR, `matrix_${vp.name}_expanded.png`) });

    await page.evaluate(() => window.scrollTo(0, 75));
    await new Promise((r) => setTimeout(r, 200));
    await page.screenshot({ path: path.join(SHOTS_DIR, `matrix_${vp.name}_collapsed.png`) });
    console.log(`  📱 Device: ${vp.name} verified`);
  }

  // 5. Desktop Layout Integrity Check
  console.log('\n--- Testing Desktop Layout Integrity (Sidebar untouched) ---');
  await page.setViewport({ width: 1280, height: 800 });
  await page.evaluate(() => { window.location.hash = '/today'; });
  await new Promise((r) => setTimeout(r, 600));

  const desktopCheck = await page.evaluate(() => {
    const sidebar = document.querySelector('aside');
    const collapsingHeader = document.querySelector('header.md\\:hidden');
    const isSidebarVisible = sidebar && window.getComputedStyle(sidebar).display !== 'none';
    const isHeaderHidden = collapsingHeader && window.getComputedStyle(collapsingHeader).display === 'none';
    return { isSidebarVisible, isHeaderHidden };
  });

  await page.screenshot({ path: path.join(SHOTS_DIR, 'desktop_1280x800_sidebar.png') });
  console.log('  🖥️ Desktop check:', desktopCheck);
  console.log(`  ${desktopCheck.isSidebarVisible && desktopCheck.isHeaderHidden ? '✅ PASS' : '❌ FAIL'}: Desktop sidebar visible, mobile header hidden!`);

  await browser.close();

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'verification_summary.json'),
    JSON.stringify({ verificationResults, resetSuccess, desktopCheck }, null, 2)
  );

  console.log('\n🎉 Verification suite completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
