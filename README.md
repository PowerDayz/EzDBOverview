# **EzDBOverview Web App**

**EzDBOverview** is a web application tailored for FiveM servers using the QBCore framework's database setup. It provides a quick and intuitive overview of the database structure, making it easier for server administrators and developers to understand their data. While it's optimized for QBCore, the application is designed with flexibility in mind. If you're using a different setup or if you'd like to adapt the tool for other purposes, you can freely modify the source code to fit your needs. Whether you're a seasoned developer, a server admin, or just someone looking for insights into your data, **EzDBOverview** is here to help!

## **Features**:

- **Easy Setup:** Get started in just a few minutes!
- **Intuitive Interface:** Navigate your database with ease.
- **Customizable:** Modify and adapt the code to fit your needs.

![Picture1](https://github.com/PowerDayz/EzDBOverview/assets/50378849/7462eef7-6432-4923-a525-bc89bbbbdb8d)
![Picture2](https://github.com/PowerDayz/EzDBOverview/assets/50378849/64cb7566-60ea-4a5d-b229-403d4c7a835a)
![Picture3](https://github.com/PowerDayz/EzDBOverview/assets/50378849/47b08fe9-5271-4552-b099-bf47d138da86)
![Picture5](https://github.com/PowerDayz/EzDBOverview/assets/50378849/d092b8bd-3dd0-4688-9214-824de8216cc8)
![Picture4](https://github.com/PowerDayz/EzDBOverview/assets/50378849/5cc37780-d644-4aab-9683-3e7bc960de7a)
![Picture6](https://github.com/PowerDayz/EzDBOverview/assets/50378849/49253f61-d88b-4ba5-9ff0-ca1eb1e97719)
![Picture7](https://github.com/PowerDayz/EzDBOverview/assets/50378849/f0a14ce0-313d-41b3-95c3-a9b12d5015f5)
![Picture8](https://github.com/PowerDayz/EzDBOverview/assets/50378849/7a84e4ee-c106-44cc-868a-dc248e075fa4)
![Picture9](https://github.com/PowerDayz/EzDBOverview/assets/50378849/f04d1b01-5e15-4b62-87da-bea5f6aa093c)

## **Configuration**:

Before diving into setup, ensure you have configured the application properly:
- Go to `src/utils/config.ts` and set the `UsingPsMdt` to `false` if you are not using ps-mdt. If you are using it, you can leave it as `true`.

## **Pre-requisites**:

- Node.js & npm installed.

## **Setting up on localhost**:

### **1. Clone the Repository**:

```bash
git clone https://github.com/PowerDayz/EzDBOverview
cd EzDBOverview
```

### 2. Add Resource To Fivem Server:

- Move the `pw-ezdboverview` folder to your resources folder
- Ensure / Start the resource in your server.cfg
```bash
ensure pw-ezdboverview
```

### **3. Database Connection**:

- Go to `backend/index.js`
- Edit the `createConnection` to match your database
- Import the `Import_This_PLZ.sql` to your database

### **4. Backend Setup**:

```bash
cd Backend
npm install
nodemon index.js
```

### **5. Frontend Setup**:

```bash
cd EzDBOverview
npm install
npm start
```

### **6. Getting God Perms**:

- Start of by creating an account in the app
- Goto your database. Goto the `ezdbusers` table and change the perm of the account you just made to God.

Your web app should now be running on `http://localhost:3000/` or the next available port, and you should be able to view and navigate through your database structure.

## **Contributing**:

We welcome contributions! If you find a bug or would like to add a feature, feel free to create an issue or open a pull request.
