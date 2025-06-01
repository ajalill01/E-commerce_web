const Admin = require('../model/Admin');
const bcrypt = require('bcrypt');

const createAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);

        const admin = new Admin({
            username: "admin",
            email: "housefindservice@gmail.com",
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();
        console.log('Admin created:', admin);
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

createAdmin();

module.exports = createAdmin;
