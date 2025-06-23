# Digital E Gram Panchayat

A web application to manage Gram Panchayat services online. Built using HTML, CSS, JS, and Firebase.

## 👥 Roles
- **User**: Register, Login, Apply for services, View status, Profile
- **Staff**: Login, View applications, Approve/Reject
- **Admin**: Manage services, View users, Assign staff

## 🧩 Features
- Firebase Authentication
- Firestore Database for storing services and applications
- Role-based dashboards
- Application status tracking

## 🛠 Technologies
- HTML, CSS, JavaScript
- Firebase Authentication & Firestore

## 🔄 Workflow
1. User signs up → Role saved in Firestore
2. User logs in → Redirected to role-based dashboard
3. Services applied → Stored in `applications` collection
4. Staff/Admin updates status → Real-time updates

## 🚀 How to Run
1. Open `index.html` in browser
2. Use Firebase credentials to register/login
3. View dashboards and use services

## 🔗 Hosted (if deployed): 
`(put your Firebase hosted link here if you hosted it)`

---

## 📁 Folder Structure
- `/html`, `/css`, `/js` (organized web files)
- `service-*.html` (each service)
- `admin-dashboard.html`, `user-dashboard.html`, etc.

---

## 🧪 Test Cases
- User registration with valid/invalid data
- Staff login
- Admin creating services
- Viewing application status

