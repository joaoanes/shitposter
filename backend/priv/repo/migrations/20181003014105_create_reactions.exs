defmodule ShitposterBackend.Repo.Migrations.CreateReactions do
  use Ecto.Migration

  def change do
    create table(:reactions) do
      add :rating_id, references(:ratings)
      add :shitpost_id, references(:shitposts)
      add :user_id, references(:users)

      timestamps()
    end

    create unique_index(:reactions, [:shitpost_id, :user_id])
  end
end
