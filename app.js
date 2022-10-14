const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const express = require("express");
const path = require("path");

let app = express();
app.use(express.json());
let db = null;
let isValid = false;

let dbPath = path.join(__dirname, "todoApplication.db");

const initialDbAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running successfully");
    });
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};

initialDbAndServer();

const convertDbObjectTORequiredObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatus = (dbObject) => {
  return dbObject.priority !== undefined && dbObject.status !== undefined;
};

const hasPriorityAndCategory = (dbObject) => {
  return dbObject.priority !== undefined && dbObject.category !== undefined;
};

const hasCategoryAndStatus = (dbObject) => {
  return dbObject.category !== undefined && dbObject.status !== undefined;
};

const hasPriority = (dbObject) => {
  return dbObject.priority !== undefined;
};

const hasStatus = (dbObject) => {
  return dbObject.status !== undefined;
};

const hasCategory = (dbObject) => {
  return dbObject.category !== undefined;
};

const hasDueDate = (dbObject) => {
  return dbObject.due_date !== undefined;
};

//API - 1
app.get("/todos/", async (request, response) => {
  let todoQuery = "";
  const { search_q = "", status, priority, category } = request.query;
  switch (true) {
    case hasPriorityAndStatus(request.query):
      todoQuery = `SELECT * FROM todo
            WHERE status = '${status}'
            AND priority = '${priority}'
            AND todo LIKE '%${search_q}%'
            ORDER BY id ASC
            ;`;
      break;

    case hasPriorityAndCategory(request.query):
      todoQuery = `SELECT * FROM todo
            WHERE priority = '${priority}'
            AND category = '${category}'
            AND todo LIKE "%${search_q}%"
            ORDER BY id ASC
            ;`;
      break;
    case hasCategoryAndStatus(request.query):
      todoQuery = `SELECT * FROM todo
            WHERE category = '${category}'
            AND status = '${status}'
            AND todo LIKE '%${search_q}%'
            ORDER BY id ASC
                ;`;
      break;
    case hasPriority(request.query):
      todoQuery = `SELECT * FROM todo
            WHERE priority = '${priority}'
            AND todo LIKE '%${search_q}%'
            ORDER BY id ASC
                ;`;
      break;

    case hasStatus(request.query):
      todoQuery = `SELECT * FROM todo
            WHERE status = '${status}'
            AND todo LIKE '%${search_q}%'
            ORDER BY id ASC
            ;`;
      break;

    case hasCategory(request.query):
      todoQuery = `SELECT * FROM todo
            WHERE category = '${category}'
            AND todo LIKE '%${search_q}%'
            ORDER BY id ASC
            ;`;
      break;

    default:
      todoQuery = `SELECT * FROM todo
            WHERE todo LIKE '%${search_q}%'
            ORDER BY id ASC
            ;`;
      break;
  }
  const dbResponse = await db.all(todoQuery);
  response.send(dbResponse);
});

//API-2
app.post("/todos/", async (request, response) => {
  try {
    const { id, todo, priority, status, category, dueDate } = request.body;
    const postQuery = `INSERT INTO todo (id,todo,priority,status,category,due_date)
    VALUES (
        ${id},
        '${todo}',
        '${priority}',
        '${status}',
        '${category}',
        '${dueDate}');`;
    const dbResponse = await db.run(postQuery);
    console.log(dbResponse);
    response.send("added Successfully");
  } catch (e) {
    console.log(`${e.message}`);
    process.exit(1);
  }
});

//API-2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo 
    WHERE id = ${todoId}
    ;`;
  const dbResponse = await db.get(todoQuery);
  response.send(convertDbObjectTORequiredObject(dbResponse));
});

//API-5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, category, todo, dueDate, priority } = request.body;
  //console.log(dueDate);
  let dbResponse = null;
  let putQuery = null;

  switch (true) {
    case hasStatus(request.body):
      putQuery = `UPDATE todo
            SET status = '${status}'
            WHERE id=${todoId}
            ;`;
      bdResponse = await db.run(putQuery);
      response.send("Status Updated");
      break;
    case hasPriority(request.body):
      putQuery = `UPDATE todo
        SET priority = '${priority}'
        WHERE id = ${todoId}
        ;`;
      dbResponse = await db.run(putQuery);
      response.send("Priority Updated");
      break;
    case hasCategory(request.body):
      putQuery = `UPDATE todo
         SET category = '${category}'
         WHERE id = ${todoId}
         ;`;
      dbResponse = await db.run(putQuery);
      response.send("Category Updated");
      break;
    case hasDueDate(request.body):
      putQuery = `UPDATE todo
        SET due_date = ${due_date}
        WHERE id = ${todoId};`;
      dbResponse = await db.run(putQuery);
      response.send("Due Date Updated");
      break;
    default:
      putQuery = `UPDATE todo 
        SET todo = '${todo}'
        WHERE id = ${todoId}
        ;`;
      dbResponse = await db.run(putQuery);
      response.send("Due Date Updated");
      break;
  }
});

//API-6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.run(todoQuery);
  response.send("Todo Deleted");
});
