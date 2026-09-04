const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(__dirname, '..', '.test_results');
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'device_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const DEVICES = [
  {
    id: 'desktop_1920x1080',
    name: 'Desktop Standard (16:9)',
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    id: 'galaxy_tab_s10_landscape',
    name: 'Samsung Galaxy Tab S10 Lite - Landscape (16:10)',
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'galaxy_tab_s10_portrait',
    name: 'Samsung Galaxy Tab S10 Lite - Portrait (16:10)',
    width: 800,
    height: 1280,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'iphone_17_pro',
    name: 'iPhone 17 Pro (19.5:9)',
    width: 402,
    height: 874,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'galaxy_f62_412',
    name: 'Samsung Galaxy F62 - 412w (20:9)',
    width: 412,
    height: 915,
    deviceScaleFactor: 2.625,
    isMobile: true,
    hasTouch: true,
  },
  {
    id: 'galaxy_f62_360',
    name: 'Samsung Galaxy F62 - 360w Compact (20:9)',
    width: 360,
    height: 800,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
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
    await page.type('input[type="email"]', testEmail, { delay: 15 });

    await page.focus('input[type="password"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('input[type="password"]', testPassword, { delay: 15 });

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 2000));
  }
}

async function closeAnyOpenModals(page) {
  await page.evaluate(() => {
    const closeBtn = document.querySelector('[data-testid="close-task-detail"]');
    if (closeBtn) {
      closeBtn.click();
    }
  });
  await page.keyboard.press('Escape');
  await new Promise((r) => setTimeout(r, 300));
}

async function run() {
  console.log('🚀 Starting Device & Aspect Ratio Responsive Testing Suite...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 1. Initial Load & Auth
  console.log('🔑 Performing initial authentication check...');
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/#/today', { waitUntil: 'networkidle0' });
  await loginIfRequired(page);

  // Wait for in-app element to confirm login
  await page.waitForSelector('main, nav, header', { timeout: 10000 }).catch(() => {});
  console.log('✅ In-app session established!');

  const testResults = [];

  for (const device of DEVICES) {
    console.log(`\n📱 Testing Device: ${device.name} [${device.width} x ${device.height}]`);
    await page.setViewport({
      width: device.width,
      height: device.height,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
    });

    await closeAnyOpenModals(page);

    const routes = [
      { path: '/today', name: 'today' },
      { path: '/tasks', name: 'tasks' },
      { path: '/notes', name: 'notes' },
      { path: '/bucket-list', name: 'bucket_list' },
      { path: '/menu', name: 'menu' },
    ];

    for (const r of routes) {
      await closeAnyOpenModals(page);

      // Navigate via hash for fast SPA routing without dropping session
      await page.evaluate((targetHash) => {
        window.location.hash = targetHash;
      }, r.path);
      await new Promise((res) => setTimeout(res, 700));

      await loginIfRequired(page);

      // Check layout health (no horizontal overflow)
      const layoutHealth = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        const scrollWidth = Math.max(
          body.scrollWidth,
          body.offsetWidth,
          html.clientWidth,
          html.scrollWidth,
          html.offsetWidth
        );
        const clientWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > clientWidth + 2;

        return {
          scrollWidth,
          clientWidth,
          hasHorizontalOverflow,
          overflowDelta: Math.max(0, scrollWidth - clientWidth),
        };
      });

      const filename = `${device.id}_${r.name}.png`;
      const filepath = path.join(SCREENSHOT_DIR, filename);
      await page.screenshot({ path: filepath, fullPage: false });

      testResults.push({
        device: device.name,
        deviceId: device.id,
        route: r.name,
        width: device.width,
        height: device.height,
        hasHorizontalOverflow: layoutHealth.hasHorizontalOverflow,
        overflowDelta: layoutHealth.overflowDelta,
        filename,
      });

      console.log(`  📸 Saved: ${filename} (Overflow: ${layoutHealth.hasHorizontalOverflow ? '⚠️ YES (' + layoutHealth.overflowDelta + 'px)' : '✅ NONE'})`);
    }

    // Interactive Test on Tasks Page: Open Task Detail Sheet
    try {
      await page.evaluate(() => {
        window.location.hash = '/tasks';
      });
      await new Promise((res) => setTimeout(res, 600));

      // Click the first task card
      const taskCard = await page.$('[data-task-item="true"]');
      if (taskCard) {
        await taskCard.click();
        await new Promise((res) => setTimeout(res, 700));
        const sheetFilename = `${device.id}_task_detail_sheet.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, sheetFilename) });
        console.log(`  📸 Saved Detail Sheet: ${sheetFilename}`);

        // Click close button
        await closeAnyOpenModals(page);
        await new Promise((res) => setTimeout(res, 400));
      }
    } catch (e) {
      console.log(`  Task detail interaction note: ${e.message}`);
    }
  }

  await browser.close();

  // Save report
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'device_test_results.json'),
    JSON.stringify(testResults, null, 2)
  );

  console.log('\n🎉 All device tests and screenshots completed successfully!');
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
