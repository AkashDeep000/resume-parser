import fs from "fs/promises";
import express from "express";
import fileUpload from "express-fileupload";
import scraper from "./utils/scraper.js";
import dotenv from "dotenv"
import { log } from "console";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from 'node-fetch';

dotenv.config()

// const dispatcher = socksagent({
//   type: 5,
//   host: "brd.superproxy.io:22225",
//   port: 9050,
//   userId: "brd-customer-hl_ef2cdf28-zone-residential_proxy1",
//   password: process.env.PASS,
// });

const agent = new HttpsProxyAgent(process.env.HTTP_PROXY);

const app = express();
app.use(fileUpload());
const port = 3001;

app.get('/profile', async (req, res) => {
  const cookie = `2&5c8dd745-10fb-4a31-8655-441f666c0436"; bscookie="v=1&20240709235637fb4b8b8e-54ea-4e8c-8585-4ef34f55b999AQHWJ6pDeIxA-gMlX1o2xQswQAbrjzBT"; li_rm=AQGVG93s_IjwsQAAAZC5NN7ZwtfhOW-ZISPHQdc2ACYE6eK4FPnJI3I-BGNiTPoUpEyunCDXPek5ubdM5ZLlaIph3b69VJwoSu4F-nEOS-ucXGCmkPGqX5Yl; timezone=Asia/Calcutta; li_theme=light; li_theme_set=app; dfpfpt=71ed830406ca466b91611d2d7c4ec133; fptctx2=taBcrIH61PuCVH7eNCyH0OPzOrGnaCb%252f7mTjN%252fuIW2tDv%252bEzQJrmc0f7kfGDhpV%252bC1hBKebp%252b%252fTYvV1mfkdGMadchIMr8FOhmHjpDdDA5LfAfX4CRaVBEdp915eQPdPJxiTGcmpDqFZApKl%252btfcU6UfN7l6xY9HGaliPLYKYpmFV1ABgrSxmrnee%252fV1NyGr7SWCa9Mx0qtsADgNftxE0YUx6RLpG1Cy5e%252b%252bbFIEwK9p8J2JAC8Hs7X2ebTVp4J03o%252f1xE8a%252fdnUFZ90hHjWIHfTQFmwPPCo7wkE1HZNK38c9lOglGwJdupHLJCR7sMz3qXONZN3dAb4zkEMFqcg8NrjbGHvQElEvV%252byw9AjkbLs%253d; li_g_recent_logout=v=1&true; visit=v=1&M; PLAY_LANG=en; PLAY_SESSION=eyJhbGciOiJIUzI1NiJ9.eyJkYXRhIjp7InNlc3Npb25faWQiOiJiODI3ODMzNy1kYzczLTQwYTUtOGMxZS1mYWNlMWVhYzEyNDJ8MTcyMTA5NDc1NCIsImFsbG93bGlzdCI6Int9IiwicmVjZW50bHktc2VhcmNoZWQiOiIiLCJyZWZlcnJhbC11cmwiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vaGVscC9saW5rZWRpbi9hbnN3ZXIvYTU2NDIyNi8iLCJyZWNlbnRseS12aWV3ZWQiOiIiLCJDUFQtaWQiOiLCsXzCkMOmYsKQwrHDjzo9wpTCicKIXHUwMDEySsO2IiwiZXhwZXJpZW5jZSI6IiIsInRyayI6IiJ9LCJuYmYiOjE3MjEwOTQ3NTQsImlhdCI6MTcyMTA5NDc1NH0.qlhXfupcPUJz-2wvFqQ8LHm81vlh6SllLl3KfaOoKNc; fid=AQGKMcCNxY1IgQAAAZC5YlJ6gnfu_6azy2FZhwiLDqoi2Jrse8LgNmgNily_BuF9TiJE_RIMAHSaiQ; lang=v=2&lang=en-us; g_state={"i_l":0}; liap=true; li_at=AQEDAU_R4ggBlnwYAAABkLl7u8oAAAGQ3Yg_yk4AWUEYfV_QqQV9dLnHEkuD264mZzjYPDU88AooIgprCkkJ0l4tUuQEnLN02tgJ39AejXBA2AGCQgZ-Mw3t47z3U23mYqv-k0Kp9VMynyp0DH9938_E; JSESSIONID="ajax:7634929468335660031"; lidc="b=TB52:s=T:r=T:a=T:p=T:g=4389:u=2:x=1:i=1721098812:t=1721180576:v=2:sig=AQFe5z8e9jHRIZFYNZHtAECC2kq1yWVD"; UserMatchHistory=AQJVbDSgVdNQbAAAAZC5fudxAXXpOo7qmoishSuu04dWQvyl-EuXC35KeN2f19HkUDDTFjys9vh7pMUZd8AYgkg2xkdN7e26UwRyA2PJkrzyyyW8IsQjuyH7h2Lp60x3JwNdFIFQZ0FMe-GGXxn7_ZNAGACzGF8RNOWHG1wC3qxjpFUNYesbSradyWADYzV4tO8T_mbUP-9tF_kKoSUBtwaAt51bTwCJk-yHEvwpkqTNPao2oKZlZ2KuVWKOU0HSX8OWMKetWyqocXG1XCYQYM4qzyviKJSdv1seb85Nuvt2GK3ny7Da8f5sfVvHwEsKQtm-5yX7EZjDTfRqgggk`
  const csrfToken = process.env.CSRFTOKEN
  log(cookie, csrfToken)
  const profileUrl = req.query.url
  log(profileUrl)
  const test = await fetch("https://geo.brdtest.com/mygeo.json", {agent})
  log(await test.json())
  const htmlRes = await fetch(profileUrl, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Mac OS\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": cookie,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET"
  });
  if (htmlRes.status !== 200) {
    log(htmlRes)
    log(await htmlRes.text())
    const data = {
      success: false,
      message: "failed to fetch profile page"
    }
    return res.status(400).json(data)
  }
  const html = await htmlRes.text()

  const profileId = html.split("urn:li:fsd_profileCard:(")[1].split(",")[0]

  const reqs = await fetch("https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1", {
    "headers": {
      "accept": "application/vnd.linkedin.normalized+json+2.1",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/json; charset=UTF-8",
      "csrf-token": csrfToken,
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Mac OS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-li-lang": "en_US",
      "x-li-track": "{\"clientVersion\":\"1.13.19864\",\"mpVersion\":\"1.13.19864\",\"osName\":\"web\",\"timezoneOffset\":5.5,\"timezone\":\"Asia/Calcutta\",\"deviceFormFactor\":\"DESKTOP\",\"mpName\":\"voyager-web\",\"displayDensity\":1.25,\"displayWidth\":1920,\"displayHeight\":1200}",
      "x-restli-protocol-version": "2.0.0",
      "cookie": cookie,
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
    },
    "body": `{\"variables\":{\"profileUrn\":\"urn:li:fsd_profile:${profileId}\"},\"queryId\":\"voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1\",\"includeWebMetadata\":true}`,
    "method": "POST"
  });

  if (reqs.status !== 200) {
    log(await reqs.text())
    const data = {
      success: false,
      message: "failed to fetch pdf link"
    }
    return res.status(400).json(data)
  }

  const data = await reqs.json()
  // @ts-ignore
  const pdfLink = data.data.data.doSaveToPdfV2IdentityDashProfileActionsV2.result.downloadUrl
  const pdfRes = await fetch(pdfLink, {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "cookie": cookie,
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  console.log(pdfRes);

  const pdfFile = await pdfRes.arrayBuffer()
  const pdfData = await scraper(pdfFile);
  return res.json(pdfData);

})

app.all("/", async (req, res) => {
  try {
    const demo = req.query.demo;
    if (!(req.files?.pdf || demo)) {
      return res
        .status(400)
        .send(
          "No PDF files is provided.\n\nView demo by adding '?demo=1' at the end of the url"
        );
    }

    let pdfBuffer;
    if (demo) {
      if (demo > 10 || demo < 1) {
        return res
          .status(400)
          .send("Only 10 demo available (must be between 1 to 10)");
      }
      pdfBuffer = await fs.readFile(`cv/${demo}.pdf`);
    } else {
      pdfBuffer = req.files.pdf.data;
    }

    const data = await scraper(pdfBuffer);
    return res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
