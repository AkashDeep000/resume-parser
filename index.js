import fs from "fs/promises";
import express from "express";
import fileUpload from "express-fileupload";
import scraper from "./utils/scraper.js";
import dotenv from "dotenv"
import { log } from "console";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from 'node-fetch';
import cors from "cors"

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
app.use(cors());
const port = 3001;

app.get('/profile', async (req, res) => {
  const cookie = `bcookie="v=2&babcd347-75c8-426c-82d0-55741348e726"; bscookie="v=1&202407161834244fbf8492-8756-46ab-8156-694232b84663AQGrtUoxBjF94UM_4MUhTnx705ax3l7O"; fid=AQGbp_7BN58y7gAAAZC802dU9hwLJnHrI2SSpbhWriFuc5Yf7SJ4CtUTjptvVKyn8vMjQyC1XTpugA; timezone=Asia/Calcutta; li_theme=light; li_theme_set=app; dfpfpt=3c205b28a4fb437a9161e9ad67480c7c; fptctx2=taBcrIH61PuCVH7eNCyH0J9Fjk1kZEyRnBbpUW3FKs95h3Tl7VraJWCL9UlSQhaKqAp7qeZvxVRdIyFPfc%252fvanSDcOvEfh%252b7lRv9hrJT8FGR%252fT0wVWQGHPH7Y3bTavurSXk%252fcnC%252f0BK3a2trruTFroDdlYpWXaaofbvMJ%252fWPbLDdcOREPQ3m3fqXXvWkj%252f1O8Dmf7%252fKbM5dtv4jLNkH0ozInC8xxwVTNyj9sUJLgqAX%252fNuVMU8akmv5LN7hYWnqRPpQC4dZCOiaYw73J0ZjQ2X28jzHKDz1hUdAA126Zh0X8oGqXXS4%252buW6nV7PTAUXjLXqfxUcOe2a%252bnY7UUCAkmI%252fGTGF4Zek%252fGn0rmeOB1tY%253d; li_g_recent_logout=v=1&true; visit=v=1&M; lang=v=2&lang=en-us; g_state={"i_l":1,"i_p":1721172788165}; liap=true; li_at=AQEDATa-dcECRGraAAABkL13WZsAAAGQ4YPdm04A0FO-3RogBN9f-118s_0UZHE9c1ZDV7lXH7q0_KGfVeKmtNeH2oGmaiaZDBMqaJcz7xoCVzpIFP1Rjvs46UHLpgy8KoWkPPFAHb8l0pnX027agQnf; JSESSIONID="ajax:3862051186780878571"; lidc="b=TB49:s=T:r=T:a=T:p=T:g=14511:u=462:x=1:i=1721165634:t=1721166903:v=2:sig=AQGk5bYrkN-dEDPkEUifBprh9E-bpS4u"; UserMatchHistory=AQLLWCSDk53HGwAAAZC9d4w_-iT9By5opyX1BM_QnRvERR09U9XDeTSZTrwTQuHNlEXk55NBnyl1DJMGGF4J1T1x2cPTRzTB_QOUSJMakKz8WXeXxsadL2e3aUguvnql1FagVjUzYuw8UkMmg6PrmtP9rvVNsD9nj4o-A5TP8CFBg9kk7oAR0E2iiFdv2xRap726d2NY8MExRnAZgHZkix_u2H8BCWwF7sADXu0Cwxe5M6I6WYN-fJ3DaFy50x_KWHWhWZXKCEqWPqe6MWAHZTp_mxZDv7SF2pTuRnTDh4exJNplpFhEHfy5wlss4fSpkHe1dFkY_4czldkmqQWI`
  const csrfToken = "ajax:3862051186780878571"
  log(cookie, csrfToken)
  const profileUrl = new URL(req.query.url)
  log({profileUrl})
  // const test = await fetch("https://geo.brdtest.com/mygeo.json", {agent})
  // log(await test.json())
  const htmlRes = await fetch(`https://www.linkedin.com/voyager/api/graphql?includeWebMetadata=true&variables=(vanityName:${profileUrl.pathname.split("/")[2]})&queryId=voyagerIdentityDashProfiles.2531a1a7d1d5530ad1834e0012bf7d50`, {
    "headers": {
      "accept": "application/vnd.linkedin.normalized+json+2.1",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,bn;q=0.7",
      "csrf-token": csrfToken,
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not/A)Brand\";v=\"8\", \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-li-lang": "en_US",
      "x-restli-protocol-version": "2.0.0",
      "cookie": cookie,
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
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

  const profileId = (await htmlRes.json()).data.data.identityDashProfilesByMemberIdentity["*elements"][0]
  log({profileId})

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
    "body": `{\"variables\":{\"profileUrn\":\"${profileId}\"},\"queryId\":\"voyagerIdentityDashProfileActionsV2.ca80b3b293240baf5a00226d8d6d78a1\",\"includeWebMetadata\":true}`,
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
  log({pdfLink})
  if (!pdfLink) {
    const data = {
      success: false,
      message: "Reached PDF download limit"
    }
    return res.status(400).json(data)
  }
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

  if (reqs.status !== 200) {
    log(await reqs.text())
    const data = {
      success: false,
      message: "failed to download pdf"
    }
    return res.status(400).json(data)
  }
  
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
