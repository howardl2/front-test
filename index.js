// Run a webscraper to get whether the two specified shipping containers are ready
const puppeteer = require('puppeteer');

let terminalUrl = 'https://www.apmterminals.com/en/los-angeles';

const not_ready_ID = 'TGCU5136642';
const ready_ID = 'HMCU9077256';

let scrape = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(terminalUrl);

  // Enter into the text input
  await page.waitForSelector('#main > div:nth-child(1) > div:nth-child(2) > div > section.track-and-trace__fields > article:nth-child(3) > div > div.track-and-trace__field > button');
  await page.focus('#main > div:nth-child(1) > div:nth-child(2) > div > section.track-and-trace__fields > article:nth-child(3) > div > div.track-and-trace__field > button');
  await page.keyboard.press('Enter');

  // input ID 1
  await page.waitForSelector('#main > div:nth-child(1) > div:nth-child(2) > div > section.track-and-trace__fields > article.track-and-trace__container.track-and-trace__container--expand > div > div.track-and-trace__field > div.track-and-trace__tags > input');
  await page.type(
    '#main > div:nth-child(1) > div:nth-child(2) > div > section.track-and-trace__fields > article.track-and-trace__container.track-and-trace__container--expand > div > div.track-and-trace__field > div.track-and-trace__tags > input',
    ready_ID,
    { delay: 20 });
  await page.keyboard.press('Enter');

  // input ID 2
  await page.type(
    '#main > div:nth-child(1) > div:nth-child(2) > div > section.track-and-trace__fields > article.track-and-trace__container.track-and-trace__container--expand > div > div.track-and-trace__field > div.track-and-trace__tags > input',
    not_ready_ID,
    { delay: 20 });
  await page.keyboard.press('Enter');

  // Press the submit button
  await page.focus('#main > div:nth-child(1) > div:nth-child(2) > div > section.track-and-trace__fields > article.track-and-trace__container.track-and-trace__container--expand > div > div.track-and-trace__submit > button');
  await page.keyboard.press('Enter');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.waitForSelector('#main > div.trace-container > div.trace-container > div > div > div.fixed-table__container');
  await page.click('#main > div.trace-container > div.trace-container > div > div > div.fixed-table__container');


  const selector = '#main > div.trace-container > div.trace-container > div > div > div.fixed-table__container > div.trace-listing__table-container > table > tbody > tr';
  const rows = await page.$$eval(selector, trs => trs.map(tr => {
    // check each row in the table
    const tds = [...tr.getElementsByTagName('td')];

    // get the container id
    const container_id = tds[0].textContent;

    // get the corresponding svg that shows whether the container is ready
    let ready = true;
    const check_ready = [...tr.getElementsByClassName('not-ready')];
    if (check_ready.length) {
      ready = false;
    }

    return {
      container_id,
      ready,
    }
  }));

  const containers = {};
  rows.map(row => {
    containers[row.container_id] = row.ready;
  });

  await browser.close();
  return containers;
};

scrape().then((containers) => {
  console.log(containers);
}).catch(e => e);