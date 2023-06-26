const express = require("express");

const router = express.Router();

router.use(express.json());

// run top to bottom
router.get("/", (req, res) => {
  res.send("User list");
});

router.get("/new", (req, res) => {
  res.send("user new");
});
router.post("/", (req, res) => {
  res.send("Create user");
});

// router
//   .get("/:id")
//   .get((req, res) => {
//     res.send(`Get user id ${req.params.id}`);
//   })
//   .put((req, res) => {
//     res.send(`Update user id ${req.params.id}`);
//   })
//   .delete((req, res) => {
//     res.send(`delete user id ${req.params.id}`);
//   });

const users = [{ name: "maikan" }, { name: "eiei" }];

router.get("/:id", (req, res) => {
  console.log(req.users);
  res.send(`Get user id ${req.params.id}`);
});

router.put("/:id", (req, res) => {
  res.send(`Update user id ${req.params.id}`);
});

router.delete("/:id", (req, res) => {
  res.send(`delete user id ${req.params.id}`);
});

router.param("id", (req, res, next, id) => {
  req.users = users[id];
  next();
});

router.post("/create/:postid", (req, res) => {
  const { postid } = req.params;
  const { message } = req.body;
  res.send({
    sum: `postId is ${postid} and message is ${message}`,
  });
});

module.exports = router;
