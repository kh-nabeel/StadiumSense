import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if(msg.type() === 'error') {
        console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  await page.goto('http://localhost:5002/staff', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 4000));
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY LENGTH:', html.length);
  if(html.includes('Something went wrong')) {
      console.log('ERROR BOUNDARY TRIGGERED!');
  } else if (html.includes('Loading Dashboard')) {
      console.log('STUCK ON LOADING!');
  } else if (html.includes('StaffDashboard') || html.includes('nav')) {
      console.log('STAFF DASHBOARD RENDERED!');
  } else {
      console.log('BODY PREVIEW:', html.substring(0, 500));
  }
  
  await browser.close();
  process.exit(0);
})();
