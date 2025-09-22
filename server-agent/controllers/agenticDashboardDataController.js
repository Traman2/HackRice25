import AgenticDashboardData from '../models/AgenticDashboardData.js';

export const getAgenticDashboardData = async (req, res) => {
    try {
        const { uid } = req.params;
        const dashboardData = await AgenticDashboardData.findOne({ uid });
        if (!dashboardData) {
            return res.status(404).json({ message: 'AgenticDashboardData not found' });
        }
        res.status(200).json(dashboardData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
