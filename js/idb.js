class IDB {

  /**
   * Initialize the indexDb
   * and create an object store.
   */
  static createIndexDB() {
    return idb.open('RR', 1, (upgradeDb) => {
      upgradeDb.createObjectStore('restaurant', {
        keyPath: 'id'
      })
    });
  }
}
