const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders');
    },
    addFolder(knex, newFolder) {
        return knex('folders').insert(newFolder)
            .returning('*')
            .then(rows => rows[0])
    },
    getFolderById(knex, id) {
        return knex
            .select('*')
            .from('folders')
            .where('id', id)
            .first()
    },
    deleteFolder(knex, id) {
        return knex('folders')
            .where({ id })
            .delete()
    },
    updateFolder(knex, id, newData) {
        return knex('folders')
            .where({ id })
            .update(newData)
    }
}

module.exports = FoldersService;