import mongoose from 'mongoose';

const AgenticDashboardDataSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    videosFileName: [{type: String}]
});

const AgenticDashboardData = mongoose.model('AgenticDashboardDataSchema', AgenticDashboardDataSchema);

export default AgenticDashboardData;
