const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: 'your_secret_key', // Replace with your secret key
    resave: false,
    saveUninitialized: false,
  })
);

// Middleware to include current date and time
app.use((req, res, next) => {
  res.locals.currentDateTime = new Date().toLocaleString();
  res.locals.user = req.session.user || null; // Add user session info to locals
  next();
});

// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => res.render('index', { title: 'Home - Your Website Name' }));
app.get('/browsepets', (req, res) => res.render('browsepets', { title: 'Browse Pets - Your Website Name' }));
app.get('/find', (req, res) => res.render('find', { title: 'Find a Pet - Your Website Name' }));
app.get('/dogcare', (req, res) => res.render('DogCare', { title: 'Dog Care - Your Website Name' }));
app.get('/catcare', (req, res) => res.render('CatCare', { title: 'Cat Care - Your Website Name' }));
app.get('/contactus', (req, res) => res.render('ContactUs', { title: 'Contact Us - Your Website Name' }));
app.get('/privacystatement', (req, res) => res.render('privacystatement', { title: 'Privacy Statement - Your Website Name' }));
app.get('/register', (req, res) => res.render('register', { title: 'Register - Your Website Name', errorMessage: '', successMessage: '' }));
app.get('/login', (req, res) => res.render('login', { title: 'Login - Your Website Name', errorMessage: '' }));

// Route for Pet Registration Page (requires login)
app.get('/PetstoGiveAway', isAuthenticated, (req, res) => {
  res.render('PetstoGiveAway', { title: 'PetstoGiveAway - Your Website Name' });
});

// Logout Route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/'); // Redirect to home page after logout
  });
});

app.post('/find', (req, res) => {
    const { petType, breed, age, gender } = req.body;
  
    // Handle "Doesn't Matter" cases
    if (breed === "Doesn't Matter") breed = '';
    if (age === "Doesn't Matter") age = '';
    if (gender === "Doesn't Matter") gender = '';
  
    fs.readFile(path.join(__dirname, 'data', 'pets.txt'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading pets file:', err);
        return res.status(500).send('Server error');
      }
  
      const pets = data.split('\n').filter(line => {
        const [id, owner, type, petBreed, petAge, petGender] = line.split(':');
        return (!petType || petType === type) &&
               (!breed || breed === petBreed || breed === '') &&
               (!age || age === petAge || age === '') &&
               (!gender || gender === petGender || gender === '');
      });
  
      res.render('findResults', { title: 'Find Results - Your Website Name', pets });
    });
  });


// Register Route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Validate username and password format
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;

  if (!usernameRegex.test(username) || !passwordRegex.test(password)) {
    return res.render('register', {
      errorMessage: 'Invalid username or password format. Username can only contain letters and digits. Password must be at least 4 characters long and have at least 1 letter and 1 digit.',
      successMessage: '',
    });
  }

  // Check for existing user
  fs.readFile(path.join(__dirname, 'data', 'login.txt'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).render('register', {
        errorMessage: 'Server error. Please try again later.',
        successMessage: '',
      });
    }

    const users = data.split('\n');
    const existingUser = users.find(user => user.split(':')[0] === username);

    if (existingUser) {
      return res.render('register', {
        errorMessage: 'Username is already taken. Please choose another one.',
        successMessage: '',
      });
    }

    // Append new user to data/login.txt
    const newUser = `${username}:${password}\n`;
    fs.appendFile(path.join(__dirname, 'data', 'login.txt'), newUser, err => {
      if (err) {
        console.error('Error writing to file:', err);
        return res.status(500).render('register', {
          errorMessage: 'Server error. Please try again later.',
          successMessage: '',
        });
      }
      res.render('register', {
        errorMessage: '',
        successMessage: 'Registration successful! You can now login.',
      });
    });
  });
});

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const credentials = `${username}:${password}`;

  // Read data/login.txt and check credentials
  fs.readFile(path.join(__dirname, 'data', 'login.txt'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).render('login', { errorMessage: "Server error. Please try again later." });
    }
    const users = data.split('\n');
    if (users.includes(credentials)) {
      req.session.user = username; // Set session user
      res.redirect('/PetstoGiveAway'); // Redirect to pet registration page
    } else {
      res.status(401).render('login', { errorMessage: "Invalid username or password. Please try again." });
    }
  });
});

// Pet Registration Route (form submission)
app.post('/register_pet', isAuthenticated, (req, res) => {
  let { petType, breed, age, gender, notes, precaution, username, email } = req.body;

  // Read the current pet data to determine the next ID
  fs.readFile(path.join(__dirname, 'data', 'pets.txt'), 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading pets file:', err);
      return res.status(500).send('Server error');
    }

    // Ensure each line starts with "User: " to be counted as an entry
    const pets = data ? data.split('\n\n').filter(line => line.startsWith('User: ')) : [];
    const nextId = pets.length + 1; // Calculate the next ID based on the number of entries

    const owner = req.session.user;

    // Construct a formatted string for petInfo
    const petInfo = `${nextId}:${owner}:${petType}:${breed}:${age}:${gender}:${notes}\n`;

    // Append the new pet information to the file
    fs.appendFile(path.join(__dirname, 'data', 'pets.txt'), petInfo, err => {
      if (err) {
        console.error('Error writing to pets file:', err);
        return res.status(500).send('Server error');
      }
      res.send('Pet registration successful');
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
