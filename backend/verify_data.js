```javascript
import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({}, { strict: false });
const Complaint = mongoose.model('Complaint', complaintSchema, 'complaints');
const Department = mongoose.model('Department', new mongoose.Schema({}, { strict: false }), 'departments');
const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');

async function run() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/gms_local');
        console.log("Connected to DB");

        const depts = await Department.find({});
        console.log(`Found ${ depts.length } Departments: `);

        for (const d of depts) {
            console.log(`- [${ d.name }](ID: ${ d._id })`);
            const cats = await Category.find({ departmentId: d._id });
            console.log(`  -> Found ${ cats.length } Categories`);
            cats.forEach(c => console.log(`     * ${ c.name } `));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
