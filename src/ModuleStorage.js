class ModuleStorage {
  constructor(db) {
    this.db = db
    this.table = 'module'
  }
  load (key, def) {
    try {
      const where = { key }
      const row = this.db.get(this.table, where)
      const data = row ? JSON.parse('' + row.data) : null
      return data ? Object.assign({}, def, data) : def
    } catch (e) {
      console.log(e)
      return def
    }
  }
  save (key, rawData) {
    const where = { key }
    const data = JSON.stringify(rawData)
    const dbData = Object.assign({}, where, {data})
    this.db.upsert(this.table, dbData, where)
  }
}

module.exports = ModuleStorage
