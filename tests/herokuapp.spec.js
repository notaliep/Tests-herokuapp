// tests/the-internet-fixed-tests.spec.js
const { test, expect } = require("@playwright/test");

// Test 1: Sprawdzenie strony głównej
test("Strona główna powinna się załadować poprawnie", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle("The Internet");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("h1")).toHaveText("Welcome to the-internet");
});

// Test 2: Test formularza logowania z wydłużonym timeoutem
test("Formularz logowania powinien działać", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/login");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("#username", { state: "visible", timeout: 10000 });
  await page.locator("#username").fill("tomsmith");
  await page.locator("#password").fill("SuperSecretPassword!");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator('button[type="submit"]').click(),
  ]);

  await expect(
    page.locator("#flash"),
    "Komunikat powodzenia powinien być widoczny"
  ).toBeVisible({ timeout: 10000 });
  await expect(page.locator("#flash")).toContainText(
    "You logged into a secure area"
  );
});

// Test 3: Test wylogowania z poprawioną obsługą nawigacji
test("Wylogowanie powinno działać", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/login");
  await page.waitForLoadState("networkidle");

  await page.locator("#username").fill("tomsmith");
  await page.locator("#password").fill("SuperSecretPassword!");

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator('button[type="submit"]').click(),
  ]);

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("a.button").filter({ hasText: "Logout" }).click(),
  ]);

  await expect(page.locator("#flash")).toBeVisible();
  await expect(page.locator("#flash")).toContainText("You logged out");
});

// Test 4: Test checkboxów
test("Checkboxy powinny działać", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/checkboxes");
  await page.waitForLoadState("networkidle");

  await page.waitForSelector('input[type="checkbox"]');
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();

  if (count >= 2) {
    const checkbox1 = checkboxes.nth(0);
    const checkbox2 = checkboxes.nth(1);

    if (!(await checkbox1.isChecked())) {
      await checkbox1.check();
      await expect(checkbox1).toBeChecked();
    }

    if (await checkbox2.isChecked()) {
      await checkbox2.uncheck();
      await expect(checkbox2).not.toBeChecked();
    }
  }
});

// Test 5: Test listy rozwijanej
test("Lista rozwijana powinna działać", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/dropdown");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("#dropdown");
  const dropdown = page.locator("#dropdown");

  // Wybierz opcję 1
  await dropdown.selectOption({ value: "1" });
  await page.waitForTimeout(500); // opóźnienie
  await expect(dropdown).toHaveValue("1");

  // Wybierz opcję 2
  await dropdown.selectOption({ value: "2" });
  await page.waitForTimeout(500); //opóźnienie
  await expect(dropdown).toHaveValue("2");
});

// Test 6: Test dynamicznego ładowania
test("Dynamiczne ładowanie powinno działać", async ({ page }) => {
  // Ustaw dłuższy timeout dla tego testu
  test.slow();

  await page.goto("https://the-internet.herokuapp.com/dynamic_loading/1");
  await page.waitForLoadState("networkidle");
  await page.locator("button").filter({ hasText: "Start" }).click();

  try {
    await page.waitForSelector("#loading", { state: "hidden", timeout: 30000 });
  } catch (e) {
    console.log("Loader nie zniknął, ale kontynuujemy test");
  }

  await page.waitForSelector("#finish h4", {
    state: "visible",
    timeout: 30000,
  });

  await expect(page.locator("#finish h4")).toBeVisible();
});

// Test 7: Test powiadomień
test("Powiadomienia powinny się wyświetlać", async ({ page }) => {
  await page.goto(
    "https://the-internet.herokuapp.com/notification_message_rendered"
  );
  await page.waitForLoadState("networkidle");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("a").filter({ hasText: "Click here" }).click(),
  ]);
  await expect(page.locator("#flash")).toBeVisible();
});

// Test 8: Test najechania myszką (hover)
test("Najechanie myszką powinno ujawniać ukryte elementy", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/hovers");
  await page.waitForLoadState("networkidle");

  const firstFigure = page.locator(".figure").first();
  await firstFigure.hover();

  await expect(firstFigure.locator(".figcaption")).toBeVisible();
  await expect(firstFigure.locator("h5")).toBeVisible();
});

// Test 9: Test przesyłania pliku
test("Przesyłanie pliku powinno działać", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/upload");
  await page.waitForLoadState("networkidle");

  //tworzenie pliku testowego
  const fileContent = "Test file content";

  await page.setInputFiles("input#file-upload", {
    name: "test-file.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(fileContent),
  });

  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.locator("#file-submit").click(),
  ]);

  await expect(page.locator("#uploaded-files")).toBeVisible();
  await expect(page.locator("h3")).toHaveText("File Uploaded!");
});

// Test 10: Test podstawowego auth
test("Basic Auth powinien działać z URL auth", async ({ page }) => {
  await page.goto("https://admin:admin@the-internet.herokuapp.com/basic_auth");
  await page.waitForLoadState("networkidle");

  await expect(page.locator("p")).toContainText("Congratulations");
});
