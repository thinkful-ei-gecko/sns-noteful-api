const notesService = {
    getAllNotes(knex) {
        return knex.select('*').from('notes')
    },
    addNote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('notes')
            .returning('*')
            .then(rows => rows[0])
    },
    getNoteById(knex, id) {
        return knex
            .select('*')
            .from('notes')
            .where('id', id)
            .first()
    },
    deleteNote(knex, id) {
        return knex('notes')
            .where({ id })
            .delete()
    },
    updateNote(knex, id, updatedNote) {
        return knex('notes')
            .where({ id })
            .update(updatedNote)
    }
}

module.exports = notesService