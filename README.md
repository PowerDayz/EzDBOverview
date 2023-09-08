# **EzDBOverview Web App**

**EzDBOverview** is a web application tailored for FiveM servers using the QBCore framework's database setup. It provides a quick and intuitive overview of the database structure, making it easier for server administrators and developers to understand their data. While it's optimized for QBCore, the application is designed with flexibility in mind. If you're using a different setup or if you'd like to adapt the tool for other purposes, you can freely modify the source code to fit your needs. Whether you're a seasoned developer, a server admin, or just someone looking for insights into your data, **EzDBOverview** is here to help!

## **Features**:

- **Easy Setup:** Get started in just a few minutes!
- **Intuitive Interface:** Navigate your database with ease.
- **Customizable:** Modify and adapt the code to fit your needs.

- ![Picture1](https://github.com/PowerDayz/EzDBOverview/assets/50378849/5ed7ac2f-4c36-40d9-9ce6-887893fc3d25)
- ![Picture2](https://github.com/PowerDayz/EzDBOverview/assets/50378849/64cb7566-60ea-4a5d-b229-403d4c7a835a)
- ![Picture3](https://github.com/PowerDayz/EzDBOverview/assets/50378849/47b08fe9-5271-4552-b099-bf47d138da86)
- ![Picture5](https://github.com/PowerDayz/EzDBOverview/assets/50378849/d092b8bd-3dd0-4688-9214-824de8216cc8)
- ![Picture4](https://github.com/PowerDayz/EzDBOverview/assets/50378849/5cc37780-d644-4aab-9683-3e7bc960de7a)
- ![Picture6](https://github.com/PowerDayz/EzDBOverview/assets/50378849/3e678ede-d624-440e-b80e-1c6b492da89e)


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
npm install
nodemon index.js
```

### **4. Frontend Setup**:

```bash
cd EzDBOverview
npm install
npm start
```

Your web app should now be running on `http://localhost:3000/` or the next available port, and you should be able to view and navigate through your database structure.

## **Contributing**:

We welcome contributions! If you find a bug or would like to add a feature, feel free to create an issue or open a pull request.
