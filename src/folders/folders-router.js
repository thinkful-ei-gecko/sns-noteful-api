const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folder-service');

const foldersRouter = express.Router();
const parser = express.json();

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name)
});

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder))
            })
            .catch(next)
    })

    .post(parser, (req, res, next) => {
        const { folder_name } = req.body
        const newFolder = { folder_name }
        if (folder_name == null) {
            return res.status(400).json({ error: { message: `Missing folder name in request body` } })
        }
        FoldersService.addFolder(req.app.get('db'), newFolder)
            .then(folder => {
                res 
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder))
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        FoldersService.getFolderById(req.app.get('db'), req.params.folder_id)
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({ error: { message: `Folder doesn't exist` }})
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeFolder(res.folder))
    })
    .delete((req, res, next) => {
        FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
            .then(numRows => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(parser, (req, res, next) => {
        const { folder_name } = req.body
        const folderToUpdate = { folder_name }

        if (!folder_name) {
            return res.status(400).json({
                error: {
                    message: 'Request body must contain a new folder name'
                }
            })
        }
        FoldersService.updateFolder(req.app.get('db'), req.params.folder_id, folderToUpdate)
            .then(numRows => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = foldersRouter;