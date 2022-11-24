


module.exports={
    verfiyuser:(req,res,next)=>{
      if (req.sesstion.user) {
        next()
      }else{
         res.redirct('') 
      }
    }
}