const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
const port = 3000;

mongoose.connect("mongodb://localhost:27017/listProject");

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const buttonSchema = new mongoose.Schema({
  name: String,
});
const Button = mongoose.model("button", buttonSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);
const defaultItems = [];

app.get("/", async function (req, res) {
  try {
    let btns = await Button.find({});
    res.render("home", { listTitles: btns });
  } catch (error) {
    console.log(error);
  }
});

app.post("/", async function (req, res) {
  let addVal = req.body.btnList;
  res.redirect("/lists/" + addVal);
});

app.post("/add", async function (req, res) {
  let newVal = _.capitalize(req.body.newBtn);
  try {
    let temp = await Button.findOne({ name: newVal });
    if (temp) {
      res.redirect("/");
    } else {
      const button = new Button({
        name: newVal,
      });
      button.save();
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/add-item", async function (req, res) {
  const newItemName = req.body.newItem;
  const listName = req.body.listName;

  const newItem = new Item({
    name: newItemName,
  });

  try {
    let list = await List.findOne({ name: listName });
    if (list) {
      list.items.push(newItem);
      await list.save();
      res.redirect("/lists/" + listName);
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

app.get("/lists/:newList", async function (req, res) {
  const newList = _.capitalize(req.params.newList);

  try {
    let itemFound = await List.findOne({ name: newList });
    if (!itemFound) {
      const list = new List({
        name: newList,
        items: defaultItems,
      });
      list.save();
      res.redirect("/lists/" + newList);
    } else {
      res.render("list", {
        listTitle: itemFound.name,
        newListItems: itemFound.items,
      });
    }
  } catch (error) {
    console.log("error finding item");
  }
});

app.post("/delete", async function (req, res) {
  let todelete = req.body.deleteItem;
  let listName = req.body.listName;
  try {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: todelete } } },
      { new: true } // To return the updated document
    );
    res.redirect("/lists/" + listName);
  } catch (error) {
    console.log(error);
  }
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/aboutme", function (req, res) {
  res.render("about");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
