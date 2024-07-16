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
  const cookie = `bcookie="v=2&babcd347-75c8-426c-82d0-55741348e726"; lang=v=2&lang=en-us; bscookie="v=1&202407161834244fbf8492-8756-46ab-8156-694232b84663AQGrtUoxBjF94UM_4MUhTnx705ax3l7O"; g_state={"i_l":0}; li_at=AQEDAU_R4ggDxgMeAAABkLzTZXgAAAGQ4N_peE4AzlgQ4Ib1-6CPupOUebd_FZ_9m806WvfxWNv4TFA2nbb6yq2B-O50_rOzi5UUnHdH4VHdRGPCll1q_eFLEIYNrV-sfFUye7PZ7bTZJFSbz93PIv8d; liap=true; JSESSIONID="ajax:2533360910652380632"; fid=AQGbp_7BN58y7gAAAZC802dU9hwLJnHrI2SSpbhWriFuc5Yf7SJ4CtUTjptvVKyn8vMjQyC1XTpugA; lidc="b=TB52:s=T:r=T:a=T:p=T:g=4389:u=3:x=1:i=1721154889:t=1721194814:v=2:sig=AQF3ejlK9iC9Ax-kuAD2kg2hPyJ3OyYS"; timezone=Asia/Calcutta; li_theme=light; li_theme_set=app; dfpfpt=3c205b28a4fb437a9161e9ad67480c7c; fptctx2=taBcrIH61PuCVH7eNCyH0J9Fjk1kZEyRnBbpUW3FKs95h3Tl7VraJWCL9UlSQhaKqAp7qeZvxVRdIyFPfc%252fvanSDcOvEfh%252b7lRv9hrJT8FGR%252fT0wVWQGHPH7Y3bTavurSXk%252fcnC%252f0BK3a2trruTFroDdlYpWXaaofbvMJ%252fWPbLDdcOREPQ3m3fqXXvWkj%252f1O8Dmf7%252fKbM5dtv4jLNkH0ozInC8xxwVTNyj9sUJLgqAX%252fNuVMU8akmv5LN7hYWnqRPpQC4dZCOiaYw73J0ZjQ2X28jzHKDz1hUdAA126Zh0X8oGqXXS4%252buW6nV7PTAUXjLXqfxUcOe2a%252bnY7UUCAkmI%252fGTGF4Zek%252fGn0rmeOB1tY%253d; UserMatchHistory=AQLjWabaD1sWIQAAAZC9bMZqHtySpjTOIpxdhCWK2L2ov5XTMk_SWxJmqyXUQEsTI-QT6OHyQ0M8FdHgF_O4KFO9B8gqcS09c6Zukm-6RfOpYMOnz-5PrbxmBR8anOvWQgMXqA4Leb4RWbYlGzunjF26g6aMExcq8vdYOB2ZIevGX8XlqRycOue-kLIaMOlInOPsUoHt6RDorhvKAjJ0lFUOu-gag4DiWzztUxP9dpUT2iz-ZqXzVjWD75eBztYkc2SFHIbccTQzke64oyW6qxAb2ofcxqMt9CbjunQLxLPLUxSKHQ1h6e6ouPA5TeLjF2-0-cwwEXqfZR2wnQiu`
  const csrfToken = "ajax:2533360910652380632"
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
