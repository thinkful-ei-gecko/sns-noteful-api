const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const parser = express.json();

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    modified: note.modified,
    content: xss(note.content),
    folder_id: note.folder_id
})

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexIns = req.app.get('db')
        NotesService.getAllNotes(knexIns)
            .then(notes => {
                res.json(notes.map(serializeNote))
            })
            .catch(next)
    })

    .post(parser, (req, res, next) => {
        const { note_name, content, folder_id } = req.body
        const newNote = { note_name, content, folder_id }

        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({ error: { message: `Missing '${key}' in request body` } })
            }
        }

        NotesService.addNote(req.app.get('db'), newNote)
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(serializeNote(note))
            })
            .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getNoteById(req.app.get('db'), req.params.note_id)
            .then(note => {
                if (!note) {
                    return res.status(404).json({ error: { message: `Note doesn't exist` } })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeNote(res.note))
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(req.app.get('db'), req.params.note_id)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(parser, (req, res, next) => {
        const { note_name, content, folder_id } = req.body
        const updatedNote = { note_name, content, folder_id }

        const numberOfValues = Object.values(updatedNote).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'note name', 'content', or 'folder id'`
                  }
            })
        NotesService.updateNote(req.app.get('db'), req.params.note_id, updatedNote)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = notesRouter;