import express from 'express';

const jsonLimit = express.json({ limit: '10kb' });

export default jsonLimit;
