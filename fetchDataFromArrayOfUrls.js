const http = require("http");
const https = require("https");

const request = async (url, method = "GET", postData) => {
  const lib = url.startsWith("https://") ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`));
      }

      const data = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => resolve(Buffer.concat(data).toString()));
    });

    req.on("error", reject);

    if (postData) {
      req.write(postData);
    }

    // IMPORTANT
    req.end();
  });
};

(async () => {
  try {
    const finalResponse = [];
    const city = "denver";
    const maxCost = 300;
    let data = await request(
      `https://jsonmock.hackerrank.com/api/food_outlets?${city}=denver&page=1`
    );
    data = JSON.parse(data);
    finalResponse.push(
      ...data.data.filter((x) => x.estimated_cost <= maxCost).map((x) => x.name)
    );
    if (data.total_pages < 2) {
      return finalResponse;
    }

    let dataNew = null;
    for (let i = 2; i <= data.total_pages; i++) {
      dataNew = await request(
        `https://jsonmock.hackerrank.com/api/food_outlets?city=${city}&page=${i}`
      );
      dataNew = JSON.parse(dataNew);
      finalResponse.push(
        ...dataNew.data
          .filter((x) => x.estimated_cost <= maxCost)
          .map((x) => x.name)
      );
    }
    return finalResponse;
  } catch (error) {
    console.error(error);
  }
})();
