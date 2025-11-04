import express from 'express';
import * as annotationController from '../controllers/annotationController.js';

const router = express.Router();

router.get('/project/:projectId', annotationController.getAnnotationsByProject);
router.post('/', annotationController.createAnnotation);
router.put('/:id', annotationController.updateAnnotation);
router.delete('/:id', annotationController.deleteAnnotation);

export default router;
