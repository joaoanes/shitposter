# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     Repo.insert!(%SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.
alias ShitposterBackend.{User, Shitpost, Rating, Source, Repo}

Repo.insert!(%Shitpost{url: "https://lifeonmars.pt", type: "webpage"})
Repo.insert!(%Shitpost{url: "https://lifeonmars.pt", type: "webpage"})
Repo.insert!(%Shitpost{url: "https://www.cats.org.uk/uploads/images/featurebox_sidebar_kids/grief-and-loss.jpg", type: "image"})
Repo.insert!(%Shitpost{url: "https://www.cats.org.uk/uploads/images/featurebox_sidebar_kids/grief-and-loss.jpg", type: "image"})
Repo.insert!(%Shitpost{url: "https://www.youtube.com/watch?v=3cXjcKTRWcg", type: "youtube"})
Repo.insert!(%Shitpost{url: "https://twitter.com/shibacentraI/status/962514110318628864", type: "tweet" })

{:ok, u} = User.create("lmaoscraper@shitposter.network", "facepunchlmao", "lmaoscraper")
{:ok, u} = User.set_bot(u)

Repo.insert!(%Source{name: "LMAO Threads (Facepunch)"})
Repo.insert!(%Source{name: "Wholesome threads (Facepunch)"})

Repo.insert!(%Rating{emoji: "💖"})
Repo.insert!(%Rating{emoji: "😅"})
Repo.insert!(%Rating{emoji: "😘"})
Repo.insert!(%Rating{emoji: "🤔"})
Repo.insert!(%Rating{emoji: "😏"})
Repo.insert!(%Rating{emoji: "🤮"})
Repo.insert!(%Rating{emoji: "👌"})
Repo.insert!(%Rating{emoji: "💅🏻"})
Repo.insert!(%Rating{emoji: "🔥"})
Repo.insert!(%Rating{emoji: "🅱️"})
Repo.insert!(%Rating{emoji: "💯"})
Repo.insert!(%Rating{emoji: "🔜"})
