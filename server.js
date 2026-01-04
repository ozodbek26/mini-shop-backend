const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 7000;
const crypto = require("crypto");

// const { z, json } = require("zod");
const z = require("zod");

app.use(cors());
app.use(express.json());
const nodemailer = require("nodemailer");

//--------------------------------------------------------------------------------------

const fs = require("fs");
const path = require("path");
const { error } = require("console");
const { text } = require("stream/consumers");
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
    // balance: z.string().optional(),
  })
  .strict();

const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8).max(20),
    oldUsername: z.string().min(5).max(20),
  })
  .strict();

// const changeImgSchema = z
//   .object({
//     img: z.string().min(1),
//   })
//   .strict();

// const statusSchema = z
//   .object({
//     status: z.enum(["покупатель", "продавец"]),
//   })
//   .strict();

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
  // balance;

  const newUser = {
    ...result.data,
    balance: 0,
  };

  Users.push(newUser);
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

app.post("/change/password", (req, res) => {
  const result = changePasswordSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Новый пароль должен быть от 8 до 20 символов",
    });
  }
  const { newPassword, oldUsername } = result.data;

  let cleanUsername = oldUsername;
  if (typeof cleanUsername === "string") {
    cleanUsername = cleanUsername.trim().replace(/^"(.*)"$/, "$1");
  }

  const user = Users.find((u) => u.username === cleanUsername);

  if (!user) {
    return res.status(400).json({
      error: "Пользователь не найден",
    });
  }

  user.Password = newPassword;
  saveUsers();

  res.json({
    success: true,
    message: "Пароль успешно изменён",
  });
});

app.post("/change/username", (req, res) => {
  console.log("Запрос на смену имени:", req.body);

  const { oldUsername, newUsername } = req.body;

  if (!oldUsername || !newUsername) {
    return res.status(400).json({
      error: "Старое и новое имя обязательны",
    });
  }

  if (newUsername.length < 5 || newUsername.length > 20) {
    return res.status(400).json({
      error: "Новое имя должно быть от 5 до 20 символов",
    });
  }

  let cleanOld = oldUsername.trim().replace(/^"(.*)"$/, "$1");
  let cleanNew = newUsername.trim();

  const userIndex = Users.findIndex((u) => u.username === cleanOld);

  if (userIndex === -1) {
    console.log("Пользователь не найден");
    return res.status(400).json({
      error: "Пользователь с таким именем не найден",
    });
  }

  const alreadyExists = Users.find(
    (u) => u.username === cleanNew && u.username !== cleanOld
  );

  if (alreadyExists) {
    console.log("Имя уже занято:", cleanNew);
    return res.status(400).json({
      error: "Это имя уже занято",
    });
  }

  console.log("Меняем имя с", Users[userIndex].username, "на", cleanNew);

  Users[userIndex].username = cleanNew;

  console.log("Новый массив Users:", Users);

  try {
    saveUsers();
    console.log("Файл users.json успешно сохранён");
  } catch (err) {
    console.error("ОШИБКА ПРИ СОХРАНЕНИИ ФАЙЛА:", err);
    return res.status(500).json({ error: "Не удалось сохранить изменения" });
  }

  res.json({
    success: true,
    message: "Имя успешно изменено",
    newUsername: cleanNew,
  });
});

app.post("/user_image_submission", (req, res) => {
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

  const user = Users.find((u) => u.username === username);

  if (!user) {
    console.log("Не найден пользователь:", username);
    return res.status(404).json({ error: "Пользователь не найден" });
  }

  console.log("Аватарка отправлена для:", username);
  res.json({
    image: user.img,
    aboutmyself: user.aboutmyself || null,
    balance: user.balance,
  });
});

const changePhotoSchema = z
  .object({
    img: z.string().min(1),
  })
  .strict();

app.post("/change/photo", (req, res) => {
  const { username, img } = req.body;

  const parsed = changePhotoSchema.safeParse({ img });
  if (!parsed.success) {
    return res.status(400).json({
      error: "Неверный формат изображения",
    });
  }

  const user = Users.find((u) => u.username === username);
  if (!user) {
    return res.status(404).json({
      error: "Пользователь не найден",
    });
  }

  user.img = parsed.data.img;
  saveUsers();

  res.json({
    message: "Картинка успешно изменена",
    img: user.img,
  });
});

app.post("/change/aboutmyself", (req, res) => {
  const { username, aboutmyself } = req.body;

  const parsed = aboutMyselfSchema.safeParse({ aboutmyself });
  if (!parsed.success) {
    return res.status(400).json({
      error: "Неверный формат текста",
    });
  }

  const user = Users.find((e) => e.username === username);

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
    aboutmyself: aboutmyself,
  });
});

app.post("/delete/account", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Нет username" });
  }

  const userIndex = Users.findIndex((u) => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Пользователь не найден" });
  }
  Users.splice(userIndex, 1);

  saveUsers();

  res.json({ success: true, message: "Аккаунт успешно удалён" });
});

const RecoverAccountSchema = z
  .object({
    emailInput: z.string().email("Некорректный email").min(3).max(50),
  })
  .strict();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ozodbek200017@gmail.com",
    pass: "fdcr sqtt dush auau",
  },
});

const recoveryTokens = [];

app.post("/recover-account", async (req, res) => {
  try {
    const parsed = RecoverAccountSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Некорректный email" });
    }

    const { emailInput } = parsed.data;
    const user = Users.find((u) => u.email === emailInput);

    if (user) {
      const randomPart = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 5 * 60 * 1000;

      const newToken = {
        randomPart,
        expiresAt,
        email: user.email,
        username: user.username,
        Password: user.Password,
      };

      const existingIndex = recoveryTokens.findIndex(
        (t) => t.email === user.email
      );
      if (existingIndex !== -1) {
        recoveryTokens.splice(existingIndex, 1);
      }

      recoveryTokens.push(newToken);

      await transporter.sendMail({
        from: '"My App" <ozodbek200017@gmail.com>',
        to: user.email,
        subject: "Восстановление пароля",
        text: `Ваш код: ${randomPart}\n\nКод действителен 5 минут.`,
        html: `<p>Ваш код: <strong>${randomPart}</strong></p><p>Действителен 5 минут.</p>`,
      });

      console.log("Письмо отправлено на:", user.email);
      console.log("Код:", randomPart);
    }

    res.json({
      success: true,
      message: "Если email зарегистрирован, мы отправили код на почту",
    });
  } catch (error) {
    console.error("Ошибка отправки:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const TokenCheckSchema = z.object({
  tokenInput: z.string().length(64),
});

app.post("/time-check", async (req, res) => {
  const parsed = TokenCheckSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Неверный формат кода" });
  }

  const { tokenInput } = parsed.data;

  const tokenData = recoveryTokens.find((t) => t.randomPart === tokenInput);

  if (!tokenData) {
    return res.status(400).json({ error: "Неверный или просроченный код" });
  }

  if (Date.now() > tokenData.expiresAt) {
    const index = recoveryTokens.indexOf(tokenData);
    if (index !== -1) recoveryTokens.splice(index, 1);

    return res.status(400).json({ error: "Код истёк" });
  }

  const index = recoveryTokens.indexOf(tokenData);
  if (index !== -1) recoveryTokens.splice(index, 1);

  res.json({
    success: true,
    message: "Код подтверждён!",
    username: tokenData.username,
    Password: tokenData.Password,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
