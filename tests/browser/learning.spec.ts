import { test, expect, type Page } from "@playwright/test";
import { vocabulary } from "../../lib/vocabulary";
import { buildPracticeActivity } from "../../lib/practice-activities";
import { seededRandom } from "../../lib/answer-choices";
import { classifyTlichoUnit } from "../../lib/tlicho-course-structure";

const storageKey = "tlicho-learning-demo-v2";
const course = vocabulary.filter(
  (word) => classifyTlichoUnit(word.category) !== null
);
const saved = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
const answer = async (page: Page, correct = true) => {
  const state = await saved(page);
  const session = state.lessonSession;
  const item = course.find(
    (word) => word.id === session.itemIds[session.index]
  )!;
  const activity = buildPracticeActivity(
    item,
    course,
    session.index,
    seededRandom(`${session.seed}:${item.id}:${session.index}`)
  );
  const option = activity.options.find((option) => option.correct === correct)!;
  await page
    .locator("button[aria-pressed]")
    .filter({ hasText: option.text })
    .click();
  await page.getByRole("button", { name: "Check answer", exact: true }).click();
};

test("refresh preserves a checked answer, order, and XP; recovery resumes the same question", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: /Meet the People, .* activities/ })
    .click();
  await answer(page);
  const before = await saved(page);
  const order = await page.locator("button[aria-pressed]").allTextContents();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Continue", exact: true })
  ).toBeVisible();
  expect((await saved(page)).xp).toBe(before.xp);
  expect(await page.locator("button[aria-pressed]").allTextContents()).toEqual(
    order
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(async () => (await saved(page)).lessonSession.index)
    .toBe(1);
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!);
    state.hearts = 1;
    localStorage.setItem(key, JSON.stringify(state));
  }, storageKey);
  await page.reload();
  await answer(page, false);
  await page.getByRole("button", { name: "Practice to refill" }).click();
  // Exercise the real heart-recovery flow using the card's meaning.
  await page.getByRole("button", { name: "Start practice" }).click();
  while (
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .isVisible()
  ) {
    const target = page.locator("p[lang]").first();
    const prompt = await target.textContent();
    const language = await target.getAttribute("lang");
    const item = vocabulary.find(
      (word) => (language === "dgr" ? word.tlicho : word.english) === prompt
    );
    if (!item)
      throw new Error("Expected a text practice prompt in this short session");
    await page
      .locator("button[aria-pressed]")
      .filter({ hasText: prompt === item.tlicho ? item.english : item.tlicho })
      .click();
    await page
      .getByRole("button", { name: "Check answer", exact: true })
      .click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await page.getByRole("button", { name: "Learn", exact: true }).last().click();
  await page
    .getByRole("button", { name: "Continue learning", exact: true })
    .click();
  expect((await saved(page)).lessonSession.index).toBe(1);
  await expect(
    page.getByRole("button", { name: "Try again", exact: true })
  ).toBeVisible();
});

test("continue card opens the next lesson even with units collapsed", async ({
  page,
}) => {
  await page.goto("/demo");
  const current = page.getByRole("button", {
    name: /Current unit.*People & Family/,
  });
  const upcoming = page.getByRole("button", {
    name: /Upcoming unit.*Home & Daily Life/,
  });
  await expect(current).toHaveAttribute("aria-expanded", "true");
  await expect(upcoming).toHaveAttribute("aria-expanded", "false");
  await current.click();
  await expect(current).toHaveAttribute("aria-expanded", "false");
  await upcoming.focus();
  await page.keyboard.press("Enter");
  await expect(upcoming).toHaveAttribute("aria-expanded", "true");
  await page
    .getByRole("button", { name: "Continue learning", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Check answer", exact: true })
  ).toBeVisible();
});

test("compact words expand with the keyboard and keep audio separate", async ({
  page,
}) => {
  await page.goto("/words");
  const row = page.locator("li").filter({
    has: page.getByRole("heading", {
      name: vocabulary[0].tlicho,
      exact: true,
    }),
  });
  const details = row.locator("details");
  await expect(details).not.toHaveAttribute("open");
  await expect(
    row.getByRole("button", {
      name: `Hear ${vocabulary[0].tlicho}`,
      exact: true,
    })
  ).toBeVisible();
  await row.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(
    row.getByRole("link", { name: /Dictionary source/ })
  ).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(details).not.toHaveAttribute("open");
  await page.screenshot({ path: "test-results/words-mobile.png" });
  await page.goto("/demo");
  await expect(
    page.getByRole("button", { name: "Continue learning", exact: true })
  ).toBeVisible();
  await page.screenshot({ path: "test-results/learn-mobile.png" });
});

test("failed audio offers text, retry, and a fresh player on the next question", async ({
  page,
}) => {
  await page.route("**/media/*.mp3", (route) => route.abort());
  await page.goto("/demo");
  await page
    .getByRole("button", { name: /Meet the People, .* activities/ })
    .click();
  for (let index = 0; index < 2; index++) {
    await answer(page);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  const hearts = (await saved(page)).hearts;
  await page
    .getByRole("button", { name: "Play pronunciation", exact: true })
    .click();
  await expect(page.getByText(/Text alternative/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry pronunciation", exact: true })
  ).toBeEnabled();
  expect((await saved(page)).hearts).toBe(hearts);
  await answer(page);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play pronunciation", exact: true })
  ).toBeEnabled();
  await expect(page.getByText(/Text alternative/)).toHaveCount(0);
});

test("storage failures remain visible and retry clears the warning", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (!(window as unknown as { allowSave: boolean }).allowSave)
        throw new DOMException("Full", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.goto("/demo");
  const warning = page
    .getByRole("alert")
    .filter({ hasText: "could not be saved" });
  await expect(warning).toBeVisible();
  await page
    .getByRole("button", { name: "Profile", exact: true })
    .last()
    .click();
  await expect(
    page.getByText("Progress is not saved", { exact: true })
  ).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { allowSave: boolean }).allowSave = true;
  });
  await page.getByRole("button", { name: "Retry saving" }).click();
  await expect(warning).toHaveCount(0);
  await expect(
    page.getByText("Progress saved in this browser", { exact: true })
  ).toBeVisible();
});

test("word library is accessible without lessons and supports search and empty states", async ({
  page,
}) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Words", exact: true }).last().click();
  await expect(page.getByRole("status")).toContainText("100 of 100 words");
  await page.getByRole("searchbox").fill("drink");
  await expect(
    page.getByRole("heading", { name: vocabulary[0].tlicho, exact: true })
  ).toBeVisible();
  await page.getByRole("searchbox").fill("no-such-word-xyz");
  await expect(page.getByText(/No matching words/)).toBeVisible();
  await page.goto("/words");
  await expect(
    page.getByRole("heading", { name: "Words", exact: true })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});

test("profile links to public about and support without payments", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: "Profile", exact: true })
    .last()
    .click();
  await page.getByRole("link", { name: "About & support" }).click();
  await expect(
    page.getByRole("heading", { name: "About & support", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Send feedback" })
  ).toHaveAttribute("href", /^mailto:support@peakhop\.app\?subject=/);
  await expect(
    page.getByRole("link", { name: "Discuss a partnership" })
  ).toHaveAttribute("href", /^mailto:support@peakhop\.app\?subject=/);
  await expect(page.getByText(/These links open your email app/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /donate|payment|subscribe/i })
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await page.screenshot({
    path: "test-results/about-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Back to learning" }).click();
  await expect(page).toHaveURL(/\/demo$/);
});
