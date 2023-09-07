# **EzDBOverview Web App**

**EzDBOverview** is a web application tailored for FiveM servers using the QBCore framework's database setup. It provides a quick and intuitive overview of the database structure, making it easier for server administrators and developers to understand their data. While it's optimized for QBCore, the application is designed with flexibility in mind. If you're using a different setup or if you'd like to adapt the tool for other purposes, you can freely modify the source code to fit your needs. Whether you're a seasoned developer, a server admin, or just someone looking for insights into your data, **EzDBOverview** is here to help!

## **Features**:

- **Easy Setup:** Get started in just a few minutes!
- **Intuitive Interface:** Navigate your database with ease.
- **Customizable:** Modify and adapt the code to fit your needs.

- ![Picture1](https://github.com/PowerDayz/EzDBOverview/assets/50378849/809f3f3c-ccf6-4cd8-8832-d4305a8c3ece)
- ![Picture2](https://github.com/PowerDayz/EzDBOverview/assets/50378849/fd942231-a16e-4744-9884-c11cc8a4c368)
- ![Picture3](https://github.com/PowerDayz/EzDBOverview/assets/50378849/47b08fe9-5271-4552-b099-bf47d138da86)
- ![Picture4](https://github.com/PowerDayz/EzDBOverview/assets/50378849/5cc37780-d644-4aab-9683-3e7bc960de7a)

## **Pre-requisites**:

- Node.js & npm installed.

## **Setting up on localhost**:

### **1. Clone the Repository**:

```bash
git clone https://github.com/PowerDayz/EzDBOverview
cd EzDBOverview
```

### **2. Database Connection**:

- Goto backend/index.js
- Edit the createConnection to match your database

### **3. Backend Setup**:

```bash
cd Backend
npm install      # Install necessary packages
nodemon index.js # Start the backend server
```

### **4. Frontend Setup**:

```bash
cd EzDBOverview
npm install      # Install necessary packages
npm start        # Start the frontend development server
```

Your web app should now be running on `http://localhost:3000/` or the next available port, and you should be able to view and navigate through your database structure.

## **Contributing**:

We welcome contributions! If you find a bug or would like to add a feature, feel free to create an issue or open a pull request.
