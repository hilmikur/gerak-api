const { FIrestore } = require('@google-cloud/firestore');

async function storeData(id, data) {
    const db = new Firestore();

    const predictCollection = db.collection('translates');
    return ptedictCollection.doc(id).set(data);
}

module.exports = storeData;
