import { test, expect } from "@playwright/test";

test("public pages expose distinct metadata, crawlable words, and structured data without JavaScript", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [path, title] of [
    ["/", "Learn Tlicho"],
    ["/words", "Tlicho Dictionary"],
    ["/about", "About & Support"],
  ]) {
    await page.goto(`http://localhost:3107${path}`);
    await expect(page).toHaveTitle(new RegExp(title));
    const canonical = await page
      .locator('link[rel="canonical"]')
      .getAttribute("href");
    const socialUrl = await page
      .locator('meta[property="og:url"]')
      .getAttribute("content");
    expect(new URL(canonical!).href).toBe(`https://learntlicho.ca${path}`);
    expect(new URL(socialUrl!).href).toBe(`https://learntlicho.ca${path}`);
    expect(await page.locator('meta[name="robots"]').count()).toBe(0);
  }
  await page.goto("http://localhost:3107/words");
  await expect(
    page.getByRole("heading", { name: "Tłı̨chǫ words & meanings" })
  ).toBeVisible();
  expect(await page.locator('li[id^="word-"]').count()).toBe(100);
  const data = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText()
  );
  expect(data["@type"]).toBe("DefinedTermSet");
  expect(data.hasDefinedTerm).toHaveLength(100);
  const id = new URL(data.hasDefinedTerm[0].url).hash.slice(1);
  await expect(page.locator(`[id="${decodeURIComponent(id)}"]`)).toHaveCount(1);
  await context.close();
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect((await sitemap.text()).match(/<loc>/g)).toHaveLength(3);
  expect(await sitemap.text()).toContain("https://learntlicho.ca/words");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Sitemap: https://learntlicho.ca/sitemap.xml"
  );
  const redirect = await request.get("/dictionary", { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe("/words");
  expect(await (await request.get("/demo")).text()).toMatch(
    /name="robots" content="noindex, follow"/
  );
});
