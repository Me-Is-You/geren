import { Builder, By, until } from 'selenium-webdriver'

const baseUrl = process.env.SIIIWEB_URL || 'http://localhost:1010'
let driver = await new Builder().forBrowser(process.env.BROWSER || 'chrome').build()
try {
  await driver.get(baseUrl)
  await driver.wait(until.elementLocated(By.css('.brand')), 5000)
  await driver.findElement(By.css('a[href="#articles"]')).click()
  await driver.findElement(By.css('a[href="#message"]')).click()
  await driver.findElement(By.css('input')).sendKeys('Selenium访客')
  await driver.findElement(By.css('textarea')).sendKeys('自动化测试留言')
  await driver.findElement(By.css('button.primary')).click()
  await driver.findElement(By.css('a[href="#admin"]')).click()
  console.log('Siiiweb Selenium flow passed')
} finally {
  await driver.quit()
}
