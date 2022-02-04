var express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/rest");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const code = req.query.code;
  let access_token = "";
  if (code) {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: "https://github-tasks.herokuapp.com/",
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    if (!data.error) {
      access_token = data.access_token;
    }
    console.log(data);
  }
  res.render("index", {
    access_token,
    title: "",
    href: "https://github.com/login/oauth/authorize?client_id=902dd85739546ddeb6ab&redirect_uri=https://github-tasks.herokuapp.com/&scope=repo user",
  });
});

router.get("/list/repos/:visibility", async function (req, res, next) {
  const visibility = req.params.visibility;
  if (!["public", "private"].includes(visibility.toLowerCase())) {
    return res.status(400).json({ error: "invalid visibility" });
  }
  res.render("listRepos", { visibility });
});

router.get("/api/repos/:visibility", async function (req, res, next) {
  const visibility = req.params.visibility;
  if (!["public", "private"].includes(visibility.toLowerCase())) {
    return res.status(400).json({ error: "invalid visibility" });
  }
  const auth = req.headers.authorization;
  console.log(auth);
  const octokit = new Octokit({
    auth,
  });
  try {
    const {
      data: { login: username },
    } = await octokit.request("/user");
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      visibility,
    });
    res.json(repos.filter((repo) => repo.owner.login === username));
  } catch (error) {
    console.log("ERROR");
    console.log(error);
    res.json(error);
  }
});

router.post("/api/repos/change/:visibility", async function (req, res, next) {
  const visibility = req.params.visibility;
  const private = visibility == "private" ? true : false;
  if (!["public", "private"].includes(visibility.toLowerCase())) {
    return res.status(400).json({ error: "invalid visibility" });
  }
  const repos = req.body.repos;
  const auth = req.headers.authorization;
  const octokit = new Octokit({
    auth,
  });
  const {
    data: { login: owner },
  } = await octokit.request("/user");
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    await octokit.rest.repos.update({
      owner,
      repo,
      private,
      visibility,
    });
  }
  res.json({ msg: "done" });
});

module.exports = router;
