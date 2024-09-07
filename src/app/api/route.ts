import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CHROMIUM_PATH =
  "https://vomrghiulbmrfvmhlflk.supabase.co/storage/v1/object/public/chromium-pack/chromium-v123.0.0-pack.tar";

async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    const chromium = await import("@sparticuz/chromium-min").then(
      (mod) => mod.default
    );

    const puppeteerCore = await import("puppeteer-core").then(
      (mod) => mod.default
    );

    const executablePath = await chromium.executablePath(CHROMIUM_PATH);

    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } else {
    const puppeteer = await import("puppeteer").then((mod) => mod.default);

    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 100,
    });
    return browser;
  }
}

const cg_login_url = "https://www.campusgroups.com/shibboleth/login?idp=cwru";
const cg_event_url = "https://community.case.edu/web/rsvp_boot?id=2258398";
const username = process.env.USERNAME;
const password = process.env.PASSWORD;

export async function GET(request: NextRequest) {
  const browser = await getBrowser();
  const pages = await browser.pages();
  const page = pages[0];

  // Navigate to the login URL
  await page.goto(cg_login_url);

  // Wait until the username/password fields are present
  await page.waitForSelector("#username", { timeout: 20000 });
  await page.waitForSelector("#password", { timeout: 20000 });

  // Enter the credentials
  if (!username || !password) {
    throw new Error("Missing environment variables for USERNAME or PASSWORD.");
  }
  await page.type("#username", username);
  await page.type("#password", password);

  // Click the login button
  await page.click("#login-submit");

  console.log("CWRU Single Sign-On button clicked successfully.");

  await page.waitForSelector('#header__account-icon', { timeout: 20000 });

  // Navigate to the event URL
  await page.goto(cg_event_url);
  console.log(`Navigated to the event URL: ${cg_event_url}`);

  // Wait for the "Register" button to be clickable and click it
  await page.click("a[href='javascript:submitRegistrationForm()']");

  console.log("Register button clicked successfully.");

  // Wait for the check icon to appear
  await page.waitForSelector('div.check-icon', { timeout: 20000 });

  console.log("Registration successful!");

  await browser.close();
  return new NextResponse(JSON.stringify({ message: "Registration successful!" }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
