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

{:ok, u} = User.create("pixies@shitpost.network", "d5a0d1c3f78330e1a1e786e9b64429b3", "Shitpost Pixies", true, false) # navy seals without spaces copypasta md5

[
  ["guest@shitpost.network", "Demo Curator 01", false, true],
  ["guest@shitpost.network", "Demo Curator 02", false, true],
  ["guest@shitpost.network", "Demo Curator 03", false, true],
  ["guest@shitpost.network", "Demo User 01", false, false],
]
|> Enum.map(fn [email, name, is_bot, is_curator] -> (
  {ok, u} = User.create(email, nil, name, is_bot, is_curator, false)
) end)

{ok, _} = User.create("joao.anes@gmail.com", "joaoanes", true, true, true)
{ok, _} = User.create(nil, "auth_bot", false, false, true)

Repo.insert!(%Source{name: "SomethingAwful"})
Repo.insert!(%Source{name: "KO Videos"})

Repo.insert!(%Rating{emoji: "💖"})
Repo.insert!(%Rating{emoji: "😂"})
Repo.insert!(%Rating{emoji: "🥺"})
Repo.insert!(%Rating{emoji: "😅"})
Repo.insert!(%Rating{emoji: "😘"})
Repo.insert!(%Rating{emoji: "🤔"})
Repo.insert!(%Rating{emoji: "😏"})
Repo.insert!(%Rating{emoji: "👌"})
Repo.insert!(%Rating{emoji: "😡"})
Repo.insert!(%Rating{emoji: "🔥"})
Repo.insert!(%Rating{emoji: "🙄"})
Repo.insert!(%Rating{emoji: "😎"})
Repo.insert!(%Rating{emoji: "🤓"})
