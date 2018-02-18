# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     ShitposterBackend.Repo.insert!(%ShitposterBackend.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
ShitposterBackend.Repo.insert!(%ShitposterBackend.Shitpost{url: "https://lifeonmars.pt", type: "webpage", rating: 1})
ShitposterBackend.Repo.insert!(%ShitposterBackend.Shitpost{url: "https://lifeonmars.pt", type: "webpage", rating: 1})
ShitposterBackend.Repo.insert!(%ShitposterBackend.Shitpost{url: "https://www.cats.org.uk/uploads/images/featurebox_sidebar_kids/grief-and-loss.jpg", type: "image", rating: 1})
ShitposterBackend.Repo.insert!(%ShitposterBackend.Shitpost{url: "https://www.cats.org.uk/uploads/images/featurebox_sidebar_kids/grief-and-loss.jpg", type: "image", rating: 1})
ShitposterBackend.Repo.insert!(%ShitposterBackend.Shitpost{url: "https://www.youtube.com/watch?v=3cXjcKTRWcg", type: "youtube", rating: 1})
ShitposterBackend.Repo.insert!(%ShitposterBackend.Shitpost{url: "https://twitter.com/shibacentraI/status/962514110318628864", type: "tweet", rating: 1})
