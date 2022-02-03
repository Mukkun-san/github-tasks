var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  const code = req.query.code;
  if (code) {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: "https://github-tasks.herokuapp.com",
        }),
        headers: { "Content-Type": "application/json" },
      }
    );
    const data = await response.json();
    console.log(data);
  }
  res.render("index", {
    title: "Express",
    href: "https://github.com/login/oauth/authorize?client_id=902dd85739546ddeb6ab&redirect_uri=https://github-tasks.herokuapp.com&scope=repo user",
  });
});

module.exports = router;
