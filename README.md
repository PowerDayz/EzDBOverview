# **EzDBOverview Web App**

**EzDBOverview** is a web application tailored for FiveM servers using the QBCore framework's database setup. It provides a quick and intuitive overview of the database structure, making it easier for server administrators and developers to understand their data. While it's optimized for QBCore, the application is designed with flexibility in mind. If you're using a different setup or if you'd like to adapt the tool for other purposes, you can freely modify the source code to fit your needs. Whether you're a seasoned developer, a server admin, or just someone looking for insights into your data, **EzDBOverview** is here to help!

## **Features**:

- **Easy Setup:** Get started in just a few minutes!
- **Intuitive Interface:** Navigate your database with ease.
- **Customizable:** Modify and adapt the code to fit your needs.

## **Pre-requisites**:

- Node.js & npm installed.

## **Setting up on localhost**:

### **1. Clone the Repository**:

```bash
git clone [Your-GitHub-Repo-URL] 
cd [Repo-Name]
```

### **2. Backend Setup**:

```bash
cd Backend
npm install      # Install necessary packages
nodemon index.js # Start the backend server
```

### **3. Frontend Setup**:

```bash
cd EzDBOverview
npm install      # Install necessary packages
npm start        # Start the frontend development server
```

Your web app should now be running on `http://localhost:3000/` or the next available port, and you should be able to view and navigate through your database structure.

## **Database Connection**:

- Goto backend/index.js
- Change db Connection to your db

## **Contributing**:

We welcome contributions! If you find a bug or would like to add a feature, feel free to create an issue or open a pull request.