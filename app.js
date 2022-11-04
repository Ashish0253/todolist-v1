//importing modules
const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');


mongoose.connect('mongodb://localhost:27017/todolistDB');
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = new mongoose.Schema({
    name: String,
    status: Boolean
});

const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
    name: 'Welcome to your Todolist.',
    status: false
})

const item2 = new Item({
    name: 'Hit the + to add new task.',
    status: false
});

const item3 = new Item({
    name: '<-- Hit this if you have completed a task.',
    status: false
});

const item4 = new Item({
    name: 'Hit this if you want to delete a task. -->',
    status: false
});

const defaultItems = [item1, item2, item3, item4];

const customListSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model('List', customListSchema);


Item.find(function(error, items) {

    if(items.length === 0) {
        Item.insertMany( defaultItems, (error) => {
            if(error) {
                console.log(error);
            } else {
                console.log('successful saved default items to db');
            }
        });
    }

});

let day = date.getDate();


// variable used later
// let items = [];
// let workItems = [];


//getting it 
app.get("/", (req, res)=> { 

    Item.find(function(error, items) {

        if(error) {
            console.log(error);
        } else {
            // items.forEach(item => console.log(item.name));

            res.render('list', {listTitle: "Today", items: items, day: day});
        }
        
    });

    
});


app.get('/:customListName', (req, res)=> {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName}, (error, foundList)=> {
        if(error) {
            console.log(error);
        } else {
            if(!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect('/'+ customListName);

            } else {
                res.render('list', {listTitle: customListName, items: foundList.items, day: day});
            }
        }
    });

    
})

//posting it
app.post("/add", (req, res)=> {
    
    let itemName = req.body.item;
    let listName = req.body.listTitle;

    const newItem = new Item( {
        name: itemName
    });

    if(listName === 'Today') {
        newItem.save().then(() => console.log('new item added'));
        
        res.redirect("/");
    } else {
        List.findOne({name: listName}, (error, foundList)=> {
            foundList.items.push(newItem);
            foundList.save().then(()=>console.log('new item added'));

            res.redirect("/" + listName);
        })
    } 
    
});


app.post('/delete', (req, res)=> {
    const trashedId = req.body.trashed;
    const listName = req.body.listName;

    if(listName === 'Today') {
        Item.deleteOne({_id: trashedId}, (error)=> {
            if(error) {
                console.log(error);
            } else {
                console.log('deleted ' + trashedId);
            }
        })

        res.redirect('/');
    } else {
        List.findOneAndUpdate({name: listName}, { $pull: {items: {_id: trashedId}}}, (err, foundList)=> {
            res.redirect('/' + listName);
        })
    }

});

//to complete
app.post('/update', (req, res)=> {
    const checkedId = req.body.checkboxed;
    const listName = req.body.listName;

    console.log(listName);

    if(listName === 'Today') {
        Item.updateOne({_id: checkedId}, {status: true}, (error)=> {
            if(error) {
                console.log(error);
            } else {
                console.log('updated' + checkedId);
            }
        })

        res.redirect('/');
    } else {
        List.findOneAndUpdate({name: listName}, {$set: {items: {status: true}}}, (err, foundList)=> {
            res.redirect('/' + listName);
        })
    }
})


app.listen(3000, ()=> {
    console.log("Server is up and running on port 3000");
})