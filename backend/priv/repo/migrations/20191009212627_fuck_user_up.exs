defmodule ShitposterBackend.Repo.Migrations.FuckUserUp do
  use Ecto.Migration

  # It turns out passwords and emails are the devil
  # And I don't want to be fined up to 4%
  # but I have a feeling I'll have to collect emails so
  def change do
    alter table(:users) do
      remove(:password_hash)
    end

    create unique_index(:users, [:name])
  end
end
