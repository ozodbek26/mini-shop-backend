const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 7000;
// const { z, json } = require("zod");
const z = require("zod");

app.use(cors());
app.use(express.json());

//--------------------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const { error } = require("console");
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");
if (!fs.existsSync(PRODUCTS_FILE))
  fs.writeFileSync(PRODUCTS_FILE, "[]", "utf8");

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return fallback;
  }
}

function saveJSONAtomic(file, data) {
  try {
    const tmp = file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, file);
  } catch (e) {
    console.error("Save error", e);
  }
}

const Users = loadJSON(USERS_FILE, []);
const product = loadJSON(PRODUCTS_FILE, []);

function saveUsers() {
  saveJSONAtomic(USERS_FILE, Users);
}
function saveProducts() {
  saveJSONAtomic(PRODUCTS_FILE, product);
}

//--------------------------------------------------------------------------------------

const RegistrationSchema = z
  .object({
    email: z.email().min(3).max(50),
    username: z.string().min(5).max(20),
    Password: z.string().min(8).max(20),
    age: z.number().min(18).max(120),
    img: z.string().optional(),
    status: z.enum(["покупатель", "продавец"]).default("покупатель"),
    aboutmyself: z
      .string()
      .optional()
      .default("про вас нет никакой инфы напишите о себе :)"),
  })
  .strict();

const username_Password = z
  .object({
    username: z.string().min(10).max(20).default("null"),
    Password: z.string().min(8).max(20).default("null"),
  })
  .partial()
  .strict();

const changeImgSchema = z
  .object({
    img: z.string().min(1),
  })
  .strict();

const statusSchema = z
  .object({
    status: z.enum(["покупатель", "продавец"]),
  })
  .strict();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/registration", (req, res) => {
  const result = RegistrationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errors: "ваше данные не прошли проверку  мы вели не правильно",
    });
  }
  const w = Users.find((e) => e.username === result.data.username);
  if (w) {
    return res.status(400).json({
      errors: "такой пользователь уже существует",
    });
  }

  Users.push(result.data);
  saveUsers();
  res.json({
    message: "Регистрация прошла успешно",
  });
});

const aboutMyselfSchema = z
  .object({
    aboutmyself: z.string().min(1).max(500),
  })
  .strict();

app.post("/userverification", (req, res) => {
  const { username, Password } = req.body;

  const user = Users.find(
    (e) => e.username === username && e.Password === Password
  );

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Неверный логин или пароль" });
  }

  res.json({ success: true, message: `Добро пожаловать! ${user.username} ` });
});

const checkingGoods = z
  .object({
    // user: z.string().default("доктор пеппер"),
    price: z.string(),
    description: z.string(),
    telephone: z.string().optional(),
    whatsapp: z.string().optional(),
    telegram: z.string().optional(),
    uniquename: z.string(),
    img1: z.string(),
    img2: z.string().optional(),
    img3: z.string().optional(),
    img4: z.string().optional(),
    img5: z.string().optional(),
  })
  .strict();

app.post("/change/username_Password", (req, res) => {
  const newData = username_Password.safeParse(req.body);
  const oldname = req.body.oldUser;

  if (!newData.success) {
    return res.status(400).json({
      errors: "Ваши данные не прошли проверку, заполните правильно",
    });
  }

  const user = Users.find((e) => e.username === oldname.username);

  if (!user) {
    return res.status(400).json({
      errors: "Такого пользователя не существует.",
    });
  }

  user.username =
    newData.data.username !== "null" ? newData.data.username : user.username;
  user.Password =
    newData.data.Password !== "null" ? newData.data.Password : user.Password;

  saveUsers();

  res.json({
    message: "Смена имени/пароля прошла успешно",
    user,
  });
});

app.post("/change/img", (req, res) => {
  const { oldUser, img } = req.body;

  const parsed = changeImgSchema.safeParse({ img });

  if (!parsed.success) {
    return res.status(400).json({
      error: "Неверный формат изображения",
    });
  }

  const user = Users.find((e) => e.username === oldUser.username);

  if (!user) {
    return res.status(400).json({
      error: "Пользователь не найден",
    });
  }

  user.img = parsed.data.img;
  saveUsers();

  res.json({
    success: true,
    message: "Картинка успешно обновлена",
    user,
  });
});


app.post("/user_image_submission", (req, res) => {
  console.log("Запрос пришёл, body:", req.body);

  let username = req.body.username;

  if (typeof username === "string") {
    username = username.trim();
    if (username.startsWith('"') && username.endsWith('"')) {
      username = username.slice(1, -1);
    }
  }

  if (!username) {
    return res.status(400).json({ error: "Нет username" });
  }

  const user = Users.find(u => u.username === username);

  if (!user) {
    console.log("Не найден пользователь:", username);
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  console.log("Аватарка отправлена для:", username);
  res.json({ image: user.img || null });
});


app.post("/change/status", (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  const oldUser = req.body.oldUser;

  if (!parsed.success) {
    return res.status(400).json({
      error: "Неверный статус",
    });
  }

  const user = Users.find((e) => e.username === oldUser.username);

  if (!user) {
    return res.status(400).json({
      error: "Пользователь не найден",
    });
  }

  user.status = parsed.data.status;
  saveUsers();

  res.json({
    success: true,
    message: "Статус успешно изменён",
    user,
  });
});

app.get("/user/info", (req, res) => {
  const { username, Password } = req.query;

  const user = Users.find(
    (e) => e.username === username && e.Password === Password
  );

  if (!user) {
    return res.status(401).json({
      error: "Пользователь не найден",
    });
  }

  res.json({
    username: user.username,
    email: user.email,
    status: user.status,
    img: user.img,
  });
});

app.post("/change/aboutmyself", (req, res) => {
  const { oldUser, aboutmyself } = req.body;

  const parsed = aboutMyselfSchema.safeParse({ aboutmyself });
  if (!parsed.success) {
    return res.status(400).json({
      error: "Неверный формат текста",
    });
  }

  const user = Users.find(
    (e) => e.username === oldUser.username && e.Password === oldUser.Password
  );

  if (!user) {
    return res.status(400).json({
      error: "Пользователь не найден",
    });
  }

  user.aboutmyself = parsed.data.aboutmyself;
  saveUsers();

  res.json({
    success: true,
    message: "Информация о себе успешно обновлена",
    user,
  });
});

app.post("/productreq", (req, res) => {
  const parsed = checkingGoods.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Что-то пошло не так, проверьте поля",
    });
  }

  const { username } = req.body;

  const user = Users.find((e) => e.username === username);

  if (!user) {
    return res.status(400).json({
      error: "Пользователь не найден",
    });
  }

  const f1 = product.find((e) => e.uniquename === parsed.uniquename);

  if (f1) {
    return res.status(400).json({
      error: "uniquename уже занять",
    });
  }

  const newProduct = {
    ...parsed.data,
    username: user.username,
    imgprofile: user.img || null,
  };

  product.push(newProduct);
  saveProducts();

  res.json({
    message: "Продукт успешно добавлен",
    product: newProduct,
  });
});

app.get("/productreq2", (req, res) => {
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
