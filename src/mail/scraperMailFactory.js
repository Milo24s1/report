const AngleEmail  = require('./angleEmail');

class ScraperEmailFactory {

    getScraperMailer(type){
        console.log('type is'+type);
        switch (type) {
            case 'Angle':
                return new AngleEmail();
                break;
            default:
                break;
        }

    }
}

module.exports = ScraperEmailFactory;







