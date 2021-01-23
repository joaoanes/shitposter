# Kittens
The scrapers behind shitpost.network

They're all functions within AWS Lambda, and each function processes something different. Some use puppeteer to scrape HTML, others connect to the APIs we want to scrape, others just deal with formatting and validation.

Since lambda has a timeout of 15 minutes, it is good form to process data as atomically as possible and commit results to s3 as soon as they're ready. 
The code should always have the expectation that it runs under borrowed time, and if interrupted it needs to understand what the latest element processed was, so that it might update indexes and give enough information to the parent process for it to be able to invoke the child function again at the stoppoint. It is recommended the use of the `executeWithRescue` function (`/kittens/src/lib/junkyard.js`) with arrays of promises.

Due to extremely good judgement, all scrapers share the same codebase (each lambda function knows what it is and can call its own code from the monolith).

## Deploying

`./build_lambda.sh` uses a docker container to run the building process, and uploads the code artifact (a zip file) to s3, where it's picked up by AWS lambda. You must then invalidate the scrapers you want updated in terraform, so it picks up the new code.
