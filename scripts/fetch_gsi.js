const fs = require("fs");

const https = require("https");
const { URL } = require("url");

function run() {
  const urlStr =
    "https://accounts.google.com/gsi/button?type=standard&shape=rectangular&theme=outline&text=signin_with&size=large&logo_alignment=left&client_id=499275020147-ba9rf5d44hvik975u4pgm5a0ng62ih1c.apps.googleusercontent.com&iframe_id=test_iframe";
  const url = new URL(urlStr);

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: "GET",
    headers: {
      Origin: "http://localhost:3000",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      Referer: "http://localhost:3000/",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      // Trimmed cookies to emulate browser session
      Cookie:
        "__Secure-3PSID=g.a0006wgtD-FMws8WCdOLUwuhDkUGTXXOoYVybmKg1LLr0oVD_4r80UTJs41fWwlhearWyJ9GcwACgYKAfoSARASFQHGX2MirDWddNMd2a12BopWW8SlfxoVAUF8yKrMBPteqkHagVWw339bHiRQ0076; NID=529=03-IVJOuFdYnUqlgnLZpVs66oGkc8FKtr7G1H-ODzRMkkMwiiBxZdOsNf8Bvl1ZSndzMv8srxoYQgT007JsxjRavMCoWE5iFqduQEv8w",
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      const outPath = "gsi_button_response_with_cookies.html";
      fs.writeFileSync(outPath, data, "utf8");
      console.log("Status:", res.statusCode);
      console.log("Wrote response to", outPath);
    });
  });

  req.on("error", (err) => {
    console.error("Request error:", err);
  });

  req.end();
}

run();
