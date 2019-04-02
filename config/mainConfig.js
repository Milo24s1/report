const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    inboxAppUrl:process.env.inboxAppUrl,
    angleSecret: process.env.angleSecret,
    dashboardUrl: process.env.dashboardUrl,
    isAngleCsvEnabled: process.env.isAngleCsvEnabled
};