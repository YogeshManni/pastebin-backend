const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { pasteColl } = require("./model.js");
const http = require("http");
const server = http.createServer(app);
const { print } = require("./helper.js");
/**************** Middelwares ****************/
//
app.use(bodyParser.json());
app.use(cors());

/********************* PORT ***********************/
const port = process.env.PORT || 5000;

/********************* Mongoose connection ****************************/
const connectionUrl =
  "mongodb+srv://pasteadmin:1v33m9ykwQ4IgHhb@cluster0.unnwqwz.mongodb.net/?retryWrites=true&w=majority"; //"mongodb://localhost:27017/testDb";

mongoose
  .connect(connectionUrl)
  .then((res, err) => {
    if (err) throw err;
    console.log("Connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });

/*****************************************************************/

const updateLink = async (data) => {
  const doc = await pasteColl.findOne({ link: data.link });
  if (doc) {
    (doc.data = data.data),
      (doc.link = data.link),
      (doc.password = data.password),
      (doc.title = data.title),
      (doc.expirationDate = data.expire),
      (doc.dateCreated = new Date());
    doc.save();
    print("Paste updated Successfully");
    return true;
  }
  print(`No paste found with Link ${data.link}`);
  return false;
};

app.post("/addPaste/:type", async (req, res) => {
  try {
    const isLinkOld = req.params.type == "old" ? true : false;
    if (isLinkOld) {
      const response = await updateLink(req.body);
      if (response) {
        res.status(200).send({ message: "Paste updated Successfully" });
        return;
      }
    }
    let paste = new pasteColl({
      data: req.body.data,
      link: req.body.link,
      password: req.body.password,
      title: req.body.title,
      expirationDate: req.body.expire,
      dateCreated: new Date(),
    });

    paste
      .save()
      .then((doc, err) => {
        if (err) throw err;
        const msg = "Paste added Successfully";
        print(msg);
        res.status(200).send({ message: msg });
      })
      .catch((err) => {
        print(err);
        res.status(500).send({ error: err });
      });
  } catch (err) {
    res.status(500).send({ error: err });
  }
});

app.get("/paste/:link", (req, res) => {
  const link = req.params.link;
  pasteColl
    .findOne({ link: link })
    .then((doc) => {
      if (!doc) {
        res.status(404).send({ message: null });
        return;
      }

      res.status(200).send({ message: "success", data: doc });
    })
    .catch((err) => {
      res.status(500).send({ message: null });
    });
});

app.get("/paste/recentPastes/:limit", async (req, res) => {
  const limit = req.params.limit;
  const docs = await pasteColl.find({}).sort({ _id: -1 }).limit(limit);
  if (docs) {
    res.status(200).send({ message: "docs fetched", data: docs });
  } else {
    res.status(404).send({ message: "no docs found" });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("Server UP fellas !!");
});

server.listen(port, () => console.log(`server is running on port ${port}`));
