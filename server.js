// const express = require("express");
// const cors = require("cors");
// const app = express();
// // const PORT = 7000;
// const PORT = process.env.PORT || 10000; // <- Render даст свой порт, 7000 для локальной проверки

// const mongoose = require("mongoose");

// mongoose
//   .connect(
//     "mongodb+srv://ozodbek:sXu99PB55kKDGP9v@cluster0.ep0acoy.mongodb.net/mini-shop?retryWrites=true&w=majority&appName=Cluster0"
//   )
//   .then(() => console.log("MongoDB подключена"))
//   .catch((err) => console.error("Ошибка подключения MongoDB:", err));const mongoose = require("mongoose");

// const BasketSchema = new mongoose.Schema({
//   whoWantsuser: String,
//   toWhomuser: String,
//   product: String,
//   date: Number,
//   price: Number,
// });

// module.exports = mongoose.model("Basket", BasketSchema);

// const crypto = require("crypto");
// const z = require("zod");
// const fs = require("fs");
// const path = require("path");
// const nodemailer = require("nodemailer");

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(cors());

// // === ФАЙЛЫ ДАННЫХ ===
// const DATA_DIR = path.join(__dirname, "data");
// const USERS_FILE = path.join(DATA_DIR, "users.json");
// const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
// const BASKET_FILE = path.join(DATA_DIR, "basket.json");

// if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
// if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]", "utf8");
// if (!fs.existsSync(PRODUCTS_FILE))
//   fs.writeFileSync(PRODUCTS_FILE, "[]", "utf8");
// if (!fs.existsSync(BASKET_FILE)) fs.writeFileSync(BASKET_FILE, "[]", "utf8");

// function loadJSON(file, fallback) {
//   try {
//     return JSON.parse(fs.readFileSync(file, "utf8"));
//   } catch (e) {
//     console.error(`Ошибка чтения ${file}:`, e);
//     return fallback;
//   }
// }

// function saveJSONAtomic(file, data) {
//   try {
//     const tmp = file + ".tmp";
//     fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
//     fs.renameSync(tmp, file);
//   } catch (e) {
//     console.error("Ошибка сохранения:", e);
//   }
// }

// let Users = loadJSON(USERS_FILE, []);
// let product = loadJSON(PRODUCTS_FILE, []);
// let basket = loadJSON(BASKET_FILE, []);

// function saveUsers() {
//   saveJSONAtomic(USERS_FILE, Users);
// }
// function saveProducts() {
//   saveJSONAtomic(PRODUCTS_FILE, product);
// }
// function saveBasket() {
//   saveJSONAtomic(BASKET_FILE, basket);
// }

// const RegistrationSchema = z
//   .object({
//     email: z.email().min(3).max(50),
//     username: z.string().min(5).max(20),
//     Password: z.string().min(8).max(20),
//     age: z.number().min(18).max(120),
//     img: z.string().optional(),
//     status: z.enum(["покупатель", "продавец"]).default("покупатель"),
//     aboutmyself: z
//       .string()
//       .optional()
//       .default("про вас нет никакой инфы напишите о себе :)"),
//   })
//   .strict();

// const changePasswordSchema = z
//   .object({
//     newPassword: z.string().min(8).max(20),
//     oldUsername: z.string().min(5).max(20),
//   })
//   .strict();

// // const changeImgSchema = z
// //   .object({
// //     img: z.string().min(1),
// //   })
// //   .strict();

// // const statusSchema = z
// //   .object({
// //     status: z.enum(["покупатель", "продавец"]),
// //   })
// //   .strict();

// // app.get("/", (req, res) => {
// //   res.send("API is running");
// //   res.json(Users);
// // });

// // Главная страница API
// app.get("/", (req, res) => {
//   res.json({ message: "Mini Shop API is running!" });
// });

// app.get("/users", (req, res) => {
//   const publicUsers = Users.map((user) => ({
//     username: user.username,
//     img: user.img || null,
//     age: user.age,
//     status: user.status || "покупатель",
//     aboutmyself: user.aboutmyself,
//     balance: user.balance,
//   }));

//   res.json({
//     users: publicUsers,
//     total: publicUsers.length,
//   });
// });

// app.post("/registration", (req, res) => {
//   const result = RegistrationSchema.safeParse(req.body);
//   if (!result.success) {
//     return res.status(400).json({
//       errors: "ваше данные не прошли проверку  мы вели не правильно",
//     });
//   }
//   const w = Users.find((e) => e.username === result.data.username);
//   if (w) {
//     return res.status(400).json({
//       errors: "такой пользователь уже существует",
//     });
//   }

//   const newUser = {
//     ...result.data,
//     balance: 0,
//   };

//   Users.push(newUser);
//   saveUsers();
//   res.json({
//     message: "Регистрация прошла успешно",
//   });
// });

// const aboutMyselfSchema = z
//   .object({
//     aboutmyself: z.string().min(1).max(500),
//   })
//   .strict();

// app.post("/userverification", (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({
//       success: false,
//       message: "Введите логин и пароль",
//     });
//   }

//   const user = Users.find(
//     (u) => u.username === username && u.Password === password
//   );

//   if (!user) {
//     return res.status(400).json({
//       success: false,
//       message: "Неверный логин или пароль",
//     });
//   }

//   res.json({
//     success: true,
//     message: `Добро пожаловать, ${user.username}!`,
//   });
// });

// app.post("/change/password", (req, res) => {
//   const result = changePasswordSchema.safeParse(req.body);

//   if (!result.success) {
//     return res.status(400).json({
//       error: "Новый пароль должен быть от 8 до 20 символов",
//     });
//   }
//   const { newPassword, oldUsername } = result.data;

//   let cleanUsername = oldUsername;
//   if (typeof cleanUsername === "string") {
//     cleanUsername = cleanUsername.trim().replace(/^"(.*)"$/, "$1");
//   }

//   const user = Users.find((u) => u.username === cleanUsername);

//   if (!user) {
//     return res.status(400).json({
//       error: "Пользователь не найден",
//     });
//   }

//   user.Password = newPassword;
//   saveUsers();

//   res.json({
//     success: true,
//     message: "Пароль успешно изменён",
//   });
// });

// app.post("/change/username", (req, res) => {
//   console.log("Запрос на смену имени:", req.body);

//   const { oldUsername, newUsername } = req.body;

//   if (!oldUsername || !newUsername) {
//     return res.status(400).json({
//       error: "Старое и новое имя обязательны",
//     });
//   }

//   if (newUsername.length < 5 || newUsername.length > 20) {
//     return res.status(400).json({
//       error: "Новое имя должно быть от 5 до 20 символов",
//     });
//   }

//   let cleanOld = oldUsername.trim().replace(/^"(.*)"$/, "$1");
//   let cleanNew = newUsername.trim();

//   const userIndex = Users.findIndex((u) => u.username === cleanOld);

//   if (userIndex === -1) {
//     console.log("Пользователь не найден");
//     return res.status(400).json({
//       error: "Пользователь с таким именем не найден",
//     });
//   }

//   const alreadyExists = Users.find(
//     (u) => u.username === cleanNew && u.username !== cleanOld
//   );

//   if (alreadyExists) {
//     console.log("Имя уже занято:", cleanNew);
//     return res.status(400).json({
//       error: "Это имя уже занято",
//     });
//   }

//   console.log("Меняем имя с", Users[userIndex].username, "на", cleanNew);

//   Users[userIndex].username = cleanNew;

//   console.log("Новый массив Users:", Users);

//   try {
//     saveUsers();
//     console.log("Файл users.json успешно сохранён");
//   } catch (err) {
//     console.error("ОШИБКА ПРИ СОХРАНЕНИИ ФАЙЛА:", err);
//     return res.status(500).json({ error: "Не удалось сохранить изменения" });
//   }

//   res.json({
//     success: true,
//     message: "Имя успешно изменено",
//     newUsername: cleanNew,
//   });
// });

// app.post("/user_image_submission", (req, res) => {
//   let username = req.body.username;

//   if (typeof username === "string") {
//     username = username.trim();
//     if (username.startsWith('"') && username.endsWith('"')) {
//       username = username.slice(1, -1);
//     }
//   }

//   if (!username) {
//     return res.status(400).json({ error: "Нет username" });
//   }

//   const user = Users.find((u) => u.username === username);

//   if (!user) {
//     console.log("Не найден пользователь:", username);
//     return res.status(404).json({ error: "Пользователь не найден" });
//   }

//   console.log("Аватарка отправлена для:", username);
//   res.json({
//     image: user.img,
//     aboutmyself: user.aboutmyself || null,
//     balance: user.balance,
//   });
// });

// const changePhotoSchema = z
//   .object({
//     img: z.string().min(1),
//   })
//   .strict();

// app.post("/change/photo", (req, res) => {
//   const { username, img } = req.body;

//   const parsed = changePhotoSchema.safeParse({ img });
//   if (!parsed.success) {
//     return res.status(400).json({
//       error: "Неверный формат изображения",
//     });
//   }

//   const user = Users.find((u) => u.username === username);
//   if (!user) {
//     return res.status(404).json({
//       error: "Пользователь не найден",
//     });
//   }

//   user.img = parsed.data.img;
//   saveUsers();

//   res.json({
//     message: "Картинка успешно изменена",
//     img: user.img,
//   });
// });

// app.post("/change/aboutmyself", (req, res) => {
//   const { username, aboutmyself } = req.body;

//   const parsed = aboutMyselfSchema.safeParse({ aboutmyself });
//   if (!parsed.success) {
//     return res.status(400).json({
//       error: "Неверный формат текста",
//     });
//   }

//   const user = Users.find((e) => e.username === username);

//   if (!user) {
//     return res.status(400).json({
//       error: "Пользователь не найден",
//     });
//   }

//   user.aboutmyself = parsed.data.aboutmyself;
//   saveUsers();

//   res.json({
//     success: true,
//     message: "Информация о себе успешно обновлена",
//     aboutmyself: aboutmyself,
//   });
// });

// app.post("/delete/account", (req, res) => {
//   const { username } = req.body;

//   if (!username) {
//     return res.status(400).json({ error: "Нет username" });
//   }

//   const userIndex = Users.findIndex((u) => u.username === username);

//   if (userIndex === -1) {
//     return res.status(404).json({ error: "Пользователь не найден" });
//   }
//   Users.splice(userIndex, 1);

//   saveUsers();

//   res.json({ success: true, message: "Аккаунт успешно удалён" });
// });

// const RecoverAccountSchema = z
//   .object({
//     emailInput: z.string().email("Некорректный email").min(3).max(50),
//   })
//   .strict();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "ozodbek200017@gmail.com",
//     pass: "fdcr sqtt dush auau",
//   },
// });

// const recoveryTokens = [];

// app.post("/recover-account", async (req, res) => {
//   try {
//     const parsed = RecoverAccountSchema.safeParse(req.body);
//     if (!parsed.success) {
//       return res.status(400).json({ error: "Некорректный email" });
//     }

//     const { emailInput } = parsed.data;
//     const user = Users.find((u) => u.email === emailInput);

//     if (user) {
//       const randomPart = crypto.randomBytes(32).toString("hex");
//       const expiresAt = Date.now() + 5 * 60 * 1000;

//       const newToken = {
//         randomPart,
//         expiresAt,
//         email: user.email,
//         username: user.username,
//         Password: user.Password,
//       };

//       const existingIndex = recoveryTokens.findIndex(
//         (t) => t.email === user.email
//       );
//       if (existingIndex !== -1) {
//         recoveryTokens.splice(existingIndex, 1);
//       }

//       recoveryTokens.push(newToken);

//       await transporter.sendMail({
//         from: '"My App" <ozodbek200017@gmail.com>',
//         to: user.email,
//         subject: "Восстановление пароля",
//         text: `Ваш код: ${randomPart}\n\nКод исчезнет через 5 минут.`,
//         html: `<p>Ваш код: <strong>${randomPart}</strong></p><p>код исчезнет через 5 минут.</p>`,
//       });

//       console.log("Письмо отправлено на:", user.email);
//       console.log("Код:", randomPart);
//     }

//     res.json({
//       success: true,
//       message: "Если email зарегистрирован, мы отправили код на почту",
//     });
//   } catch (error) {
//     console.error("Ошибка отправки:", error);
//     res.status(500).json({ error: "Ошибка сервера" });
//   }
// });

// const TokenCheckSchema = z.object({
//   tokenInput: z.string().length(64),
// });

// app.post("/time-check", async (req, res) => {
//   const parsed = TokenCheckSchema.safeParse(req.body);

//   if (!parsed.success) {
//     return res.status(400).json({ error: "Неверный формат кода" });
//   }

//   const { tokenInput } = parsed.data;

//   const tokenData = recoveryTokens.find((t) => t.randomPart === tokenInput);

//   if (!tokenData) {
//     return res.status(400).json({ error: "Неверный или просроченный код" });
//   }

//   if (Date.now() > tokenData.expiresAt) {
//     const index = recoveryTokens.indexOf(tokenData);
//     if (index !== -1) recoveryTokens.splice(index, 1);

//     return res.status(400).json({ error: "Код истёк" });
//   }

//   const index = recoveryTokens.indexOf(tokenData);
//   if (index !== -1) recoveryTokens.splice(index, 1);

//   res.json({
//     success: true,
//     message: "Код подтверждён!",
//     username: tokenData.username,
//     Password: tokenData.Password,
//   });
// });

// const checkingProduct = z
//   .object({
//     username: z.string().min(1, "Username обязателен"),
//     price: z.number().min(1).max(9999999999),
//     productName: z.string().min(10).max(250),
//     peculiarities: z.string().min(20).max(750),
//     deliveryMethod: z.string().min(10).max(250),
//     storageTime: z.string().min(10).max(250),
//     category: z.string().min(1),
//     hashtags: z.array(z.string()).min(5).max(20),
//     images: z.array(z.string()).min(5).max(5),
//   })
//   .strict();

// app.post("/checking-product", (req, res) => {
//   const body = {
//     ...req.body,
//     price: Number(req.body.price),
//   };

//   const parsed = checkingProduct.safeParse(body);

//   if (!parsed.success) {
//     return res.status(400).json({
//       error: parsed.error.errors,
//       message: "вы отправили не корректные  данные",
//     });
//   }
//   const randomPart = crypto.randomBytes(32).toString("hex");

//   const productWithToken = { ...parsed.data, token: randomPart };

//   product.push(productWithToken);
//   saveProducts();

//   res.json({ message: "успешно опубликовано", data: parsed.data });
// });

// app.get("/product", (req, res) => {
//   res.json(product);
// });

// const checkoutSchema = z.object({
//   username: z.string().min(1),
//   product1token: z.string().min(1),
//   price: z.number().positive("price должен быть числом больше 0"),
// });

// app.post("/checkout-basket", (req, res) => {
//   const parseResult = checkoutSchema.safeParse(req.body);

//   if (!parseResult.success) {
//     return res.status(400).json({ error: parseResult.error.errors[0].message });
//   }

//   const { username, product1token, price } = parseResult.data;

//   const foundProduct = product.find((p) => p.token === product1token);
//   if (!foundProduct) {
//     return res.status(400).json({ error: "Такого продукта нет на сервере" });
//   }

//   const userExists = Users.some((u) => u.username === username);
//   if (!userExists) {
//     return res.status(400).json({ error: "Вы не зарегистрированы" });
//   }

//   if (username === foundProduct.username) {
//     return res
//       .status(400)
//       .json({ error: "Вы не можете купить продукт у себя" });
//   }

//   const alreadyInCart = basket.some(
//     (e) => e.product === product1token && e.whoWantsuser === username
//   );

//   if (alreadyInCart) {
//     return res.status(400).json({ error: "этот продукт уже в корзине" });
//   }

//   basket.push({
//     whoWantsuser: username,
//     toWhomuser: foundProduct.username,
//     product: foundProduct.token,
//     date: Date.now(),
//     price,
//   });

//   saveBasket();

//   res.json({
//     success: true,
//     message: "Продукт успешно добавлен в корзину",
//   });
// });

// app.post("/check-cart", (req, res) => {
//   const { username } = req.body;

//   if (!username) {
//     return res.status(400).json({ error: "username обязателен" });
//   }

//   const user = Users.find((e) => e.username === username);
//   if (!user) {
//     return res.status(400).json({ error: "вы не зарегистрированы" });
//   }

//   const userBasket = basket.filter((e) => e.whoWantsuser === username);

//   const productServer = product.filter((p) =>
//     userBasket.some((b) => b.product === p.token)
//   );

//   res.json({
//     success: true,
//     items: userBasket,
//     products: productServer,
//   });
// });

// // app.listen(PORT, () => {
// //   console.log(`Server listening on port ${PORT}`);
// //   console.log(`http://localhost:${PORT}`);
// // });
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Сервер успешно запущен на порту ${PORT}`);
// });

// // GoDaddy

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const z = require("zod");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

// ------------------------
// Подключение MongoDB
// ------------------------
mongoose
  .connect(
    "mongodb+srv://ozodbek:sXu99PB55kKDGP9v@cluster0.ep0acoy.mongodb.net/mini-shop?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB подключена"))
  .catch((err) => console.error("Ошибка подключения MongoDB:", err));

// ------------------------
// Подключение моделей
// ------------------------
const User = require("./models/User");
const Product = require("./models/Product");
const Basket = require("./models/Basket");

// ------------------------
// Валидация
// ------------------------
const RegistrationSchema = z.object({
  email: z.string().email(),
  username: z.string().min(5),
  Password: z.string().min(8),
  age: z.number().min(18),
  img: z.string().optional(),
  status: z.enum(["покупатель", "продавец"]).default("покупатель"),
  aboutmyself: z.string().optional(),
});

const aboutMyselfSchema = z.object({
  aboutmyself: z.string().min(1).max(500),
});

// ------------------------
// Главная страница API
// ------------------------
app.get("/", (req, res) => {
  res.json({ message: "Mini Shop API is running!" });
});

// ------------------------
// Получение списка пользователей
// ------------------------
app.get("/users", async (req, res) => {
  const users = await User.find({}, { Password: 0 });
  res.json({ users, total: users.length });
});

// ------------------------
// Регистрация
// ------------------------
app.post("/registration", async (req, res) => {
  const result = RegistrationSchema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({ error: "Некорректные данные" });

  const exists = await User.findOne({ username: result.data.username });
  if (exists)
    return res.status(400).json({ error: "Пользователь уже существует" });

  await User.create({
    ...result.data,
    balance: 0,
  });

  res.json({ message: "Регистрация прошла успешно" });
});

// ------------------------
// Логин
// ------------------------
app.post("/userverification", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, Password: password });

  if (!user)
    return res.status(400).json({
      success: false,
      message: "Неверный логин или пароль",
    });

  res.json({
    success: true,
    message: `Добро пожаловать, ${user.username}!`,
  });
});

// ------------------------
// Смена пароля
// ------------------------
app.post("/change/password", async (req, res) => {
  const { oldUsername, newPassword } = req.body;

  const user = await User.findOne({ username: oldUsername });
  if (!user) return res.status(400).json({ error: "Пользователь не найден" });

  user.Password = newPassword;
  await user.save();

  res.json({ success: true, message: "Пароль изменён" });
});

// ------------------------
// Смена username
// ------------------------
app.post("/change/username", async (req, res) => {
  const { oldUsername, newUsername } = req.body;

  const exists = await User.findOne({ username: newUsername });
  if (exists) return res.status(400).json({ error: "Имя уже занято" });

  const user = await User.findOne({ username: oldUsername });
  if (!user) return res.status(400).json({ error: "Пользователь не найден" });

  user.username = newUsername;
  await user.save();

  res.json({
    success: true,
    message: "Имя успешно изменено",
    newUsername,
  });
});

// ------------------------
// Загрузка аватарки
// ------------------------
app.post("/change/photo", async (req, res) => {
  const { username, img } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Пользователь не найден" });

  user.img = img;
  await user.save();

  res.json({ message: "Фото обновлено", img: user.img });
});

// ------------------------
// Получение данных профиля
// ------------------------
app.post("/user_image_submission", async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  res.json({
    image: user.img,
    aboutmyself: user.aboutmyself,
    balance: user.balance,
  });
});

// ------------------------
// Обновление информации "о себе"
// ------------------------
app.post("/change/aboutmyself", async (req, res) => {
  const { username, aboutmyself } = req.body;

  const parsed = aboutMyselfSchema.safeParse({ aboutmyself });
  if (!parsed.success)
    return res.status(400).json({ error: "Неверный формат" });

  await User.updateOne({ username }, { aboutmyself });

  res.json({ success: true, message: "Информация обновлена" });
});

// ------------------------
// Удаление аккаунта
// ------------------------
app.post("/delete/account", async (req, res) => {
  const { username } = req.body;

  await User.deleteOne({ username });

  res.json({ success: true, message: "Аккаунт удалён" });
});

// ------------------------
// Публикация товара
// ------------------------
app.post("/checking-product", async (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");

  await Product.create({
    ...req.body,
    price: Number(req.body.price),
    token,
  });

  res.json({ message: "Успешно опубликовано" });
});

// ------------------------
// Получить товары
// ------------------------
app.get("/product", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ------------------------
// Добавить в корзину
// ------------------------
app.post("/checkout-basket", async (req, res) => {
  const { username, product1token, price } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Вы не зарегистрированы" });

  const prod = await Product.findOne({ token: product1token });
  if (!prod) return res.status(400).json({ error: "Продукта нет" });

  if (prod.username === username)
    return res.status(400).json({ error: "Нельзя купить у себя" });

  const exists = await Basket.findOne({
    whoWantsuser: username,
    product: product1token,
  });

  if (exists) return res.status(400).json({ error: "Уже в корзине" });

  await Basket.create({
    whoWantsuser: username,
    toWhomuser: prod.username,
    product: product1token,
    date: Date.now(),
    price,
  });

  res.json({ success: true, message: "Добавлено в корзину" });
});

// ------------------------
// Получить корзину
// ------------------------
app.post("/check-cart", async (req, res) => {
  const { username } = req.body;

  const items = await Basket.find({ whoWantsuser: username });

  const products = await Product.find({
    token: { $in: items.map((i) => i.product) },
  });

  res.json({ success: true, items, products });
});

// ------------------------
// Запуск сервера
// ------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Сервер успешно запущен на порту ${PORT}`);
});
