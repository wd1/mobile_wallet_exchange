import { readFileSync, writeFile } from 'fs';
import * as mkdirp from 'mkdirp';
import { join } from 'path';
import { browser } from 'protractor';

const distribution: string = JSON.parse(
  readFileSync('src/assets/appConfig.json', 'utf8')
).packageName;

const dir = join('test', 'visual', 'latest', distribution);
// create dir if it doesn't exist
mkdirp(dir);

// Dark magic to override proprietary `-apple-system` font for visual regression
// screenshots (to avoid false alarms when testing on non-macOS systems) 🧙
const hackAppleSysFont =
  "@font-face { font-family: -apple-system; src: local('Roboto'); }";

const jsToInjectCSSHack = `
var elem = document.createElement('style');
elem.innerHTML = "${hackAppleSysFont}";
document.body.appendChild(elem);
`;

export async function takeScreenshot(name: string) {
  browser.executeScript(jsToInjectCSSHack);
  const config = await browser.getProcessedConfig();
  const deviceName = config['capabilities'].name;
  const pngData = await browser.takeScreenshot();
  const path = join(dir, `${name}_${deviceName}.png`);
  writeFile(path, pngData, { encoding: 'base64' }, err => {
    // tslint:disable-next-line:no-console
    err ? console.error(err) : console.log(`File written: ${path}`);
  });
}
