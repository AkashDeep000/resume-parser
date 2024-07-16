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
  const cookie = process.env.COOKIE
  const csrfToken = process.env.CSRFTOKEN
  log(cookie, csrfToken)
  const profileUrl = req.query.url
  log(profileUrl)
  const test = await fetch("https://geo.brdtest.com/mygeo.json", {agent})
  log(await test.json())
  const htmlRes = await fetch(profileUrl, {
    agent,
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
    const data = {
      success: false,
      message: "failed to fetch profile page"
    }
    return res.status(400).json(data)
  }
  const html = await htmlRes.text()

  const profileId = html.split("urn:li:fsd_profileCard:(")[1].split(",")[0]

  const reqs = await fetch("https://www.linkedin.com/voyager/api/graphql?action=execute&queryId=voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1", {
    agent,
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
    agent,
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
