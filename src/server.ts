import express from 'express';
import bodyParser from 'body-parser';
import {deleteLocalFiles, runCannyEdgeDetector} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @DONE IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage" , async (req: express.Request, res: express.Response) => {
    const image_url: string = req.query.image_url;
    
    // validate the image_url query
    if (!image_url) return res.status(404).send("Invalid request.");

    try {
      const path_to_edge_image: string = await runCannyEdgeDetector(image_url);
      return res.status(200).sendFile(path_to_edge_image, 
          (err: Error) => {
            if (err) 
              return err;
            else {
              deleteLocalFiles([path_to_edge_image])
                  .catch( (err: Error) => {  console.log(`Delete failed: ${err.message}`) });
            }
          });
    } catch (err) {
      return res.status(422).send(err.message);
    }
  });
  //! END @DONE
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: express.Request, res: express.Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();