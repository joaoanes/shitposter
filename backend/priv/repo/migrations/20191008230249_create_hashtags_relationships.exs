defmodule ShitposterBackend.Repo.Migrations.CreateHashtagsRelationships do
  use Ecto.Migration

  def change do
    create table(:hashtags_shitposts) do
      add :shitpost_id, references(:shitposts)
      add :hashtag_id, references(:hashtags)
    end

    create index(:hashtags_shitposts, [:hashtag_id])
    create index(:hashtags_shitposts, [:shitpost_id])
  end
end
