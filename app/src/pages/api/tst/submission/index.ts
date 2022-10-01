import { authorize } from '@/lib/api/authorize';
import { db } from '@/lib/db/db';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Create / update a TST
 * Add a submission for a TST
 * Create a selection criteria
 */

const handler = async (req: NextApiRequest, res: NextApiResponse) => { 
  if(req.method == 'POST'){
    let {authorized, user} = await authorize(req, res, true)
    if(!authorized) return res.status(401).send(null)

    try {
      const writer = req.body.writer ? req.body.writer === 'true' : false;
      let sub = await db.submission.findFirst({where: {tstId: req.body.tstId, authorId: req.body.userId}})
      if(sub){
        sub = await db.submission.update({where: {id: sub.id}, data: {answers: req.body.answers, writer}})
      } else {
        sub = await db.submission.create({
          data: {
            writer,
            answers: req.body.answers,
            tstId: req.body.tstId,
            authorId: req.body.userId
          }
        })
      }

      return res.status(200).json({
        sub
      })
    } catch (e) {
      return res.status(400).json({
        error: 'submission already exists',
        message: e
      })
    }
  } else if(req.method == 'GET') {
    const {authorized, user} = await authorize(req, res, false)
    if(!authorized) return res.status(401).send(null)

    const tsts = await db.tST.findMany({where: {}});
    return res.status(200).json({
      tsts
    })
  }

  return res.status(400).send(null)
}

export default handler;
