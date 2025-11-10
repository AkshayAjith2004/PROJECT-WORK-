Haritha Karma Sena (HKS) - Full feature demo project
---------------------------------------------------
# Haritha Karma Sena - PHP Full Project

## 🧩 Step 1: Install & Start XAMPP
1. Download XAMPP: https://www.apachefriends.org/download.html
2. Open the XAMPP Control Panel.
3. Start both **Apache** and **MySQL**.

---

## 📁 Step 2: Place the Project in `htdocs`
1. Go to your XAMPP installation folder (usually):
   ```
   C:\xampp\htdocs\
   ```
2. Extract the ZIP file `haritha-karma-sena-full.zip`.
3. Rename the extracted folder to:
   ```
   C:\xampp\htdocs\haritha\
   ```

---

## 🗄️ Step 3: Create the Database
1. Open your browser → go to:
   ```
   http://localhost/phpmyadmin
   ```
2. Click **“New”** → name the database `hks` → click **Create**.
3. Click **Import** → **Choose File** → select:
   ```
   hks/db.sql
   ```
   → click **Go**.

---

## ⚙️ Step 4: Configure Database in PHP
Open the file:
```
C:\xampp\htdocs\haritha\config.php
```
Ensure it has your local MySQL credentials:
```php
<?php
session_start();
$mysqli = new mysqli('localhost', 'root', '', 'hks');
if ($mysqli->connect_error) {
    die('Database connection error: ' . $mysqli->connect_error);
}
?>
```

*(Default MySQL credentials: user = `root`, password = ``)*

---

## 🧑‍💼 Step 5: Create Admin User
1. Visit:
   ```
   http://localhost/haritha/setup_admin.php
   ```
2. It will create the default admin account:
   ```
   Email: admin@hks.local
   Password: admin123
   ```
3. After success, delete `setup_admin.php` for security.

---

## 🖥️ Step 6: Run the Website
Visit:
```
http://localhost/haritha/
```
You’ll see the Haritha Karma Sena home page.

- **Admin:** Manage users, workers, payments  
- **User:** Request collection, payments, complaints, feedback  
- **Worker:** View assigned requests, feedback  
- Razorpay/Stripe demo buttons included

---

## 🧩 Optional: Customize or Develop Further
- Replace images in `assets/img/`
- Update text in `index.php` for your region
- For live Razorpay/Stripe integration:
  - Get API keys from their dashboards
  - Replace test keys in `payment.php`

---

## 🧾 Folder Structure
```
haritha/
│
├── config.php
├── db.sql
├── index.php
├── login.php
├── signup.php
├── logout.php
├── profile.php
│
├── user_dashboard.php
├── worker_dashboard.php
├── worker_action.php
│
├── admin_dashboard.php
├── admin_edit_user.php
│
├── complaint.php
├── feedback.php
├── payment.php
│
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
│
└── README.md
```

---

✅ **Done!** You now have a fully working Haritha Karma Sena web app on XAMPP.
