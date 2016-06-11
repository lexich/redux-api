import { Router } from "express";
import rest from "./rest";
import fetch from "../../../src/adapters/serverfetch";

const router = Router();

function info(name) {
  return { message: `Hello ${name}` };
}

fetch.use("info", function(url, opt, { pathvars, params }) {
  return info(pathvars.name);
});

router.get("/info/:name", (req, res)=> {
  console.log("Send /info");

  const json = info(req.params.name);
  res.json(json);
});

export default router;
