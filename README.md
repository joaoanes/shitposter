## shitpost.network
A content curation and archival tool, intended for personal use.

# Folder structure
1. `backend` contains the webserver code, a Phoenix/Ecto app that exposes a graphql endpoint.
1. `frontend-refresh` contains the frontend (presumably refreshed), a React app that deploys to s3.
1. `kittens` contains all the scraper code that populates the backend database.
1. `marionett` contains the scraper control panel frontend, a React app.
1. `terraform` contains all infrastructure-as-code stuff to setup the necessary infra (including scrapers).

You might feel there are other folders still left unexplained. Just... ignore those.

You might also feel there are aws credentials leaking. [That's ok.](https://i.kym-cdn.com/entries/icons/mobile/000/001/461/Good_Luck_I_m_Behind_7_Proxies.jpg)
