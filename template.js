

// Секретний ключ для підпису JWT токенів
const JWT_SECRET = 'your_secret_key';

// Функція для створення та підпису access токену
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30m' });
};

// Функція для створення та підпису refresh токену
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// Маршрутизація
app.use(express.json());
app.use(cors());

// Реєстрація користувача
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Хешування пароля
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ username, email, passwordHash });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Авторизація користувача
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Пошук користувача за email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Перевірка пароля
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Створення та відправка access та refresh токенів
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});