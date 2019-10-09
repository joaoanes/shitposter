defmodule ShitposterBackend.Repo.Migrations.CreateSeenShitposts do
  use Ecto.Migration

  def change do
    create table(:seen_shitposts) do
      add :user_id, references(:users, on_delete: :nothing)
      add :shitpost_id, references(:shitposts, on_delete: :nothing)

      timestamps()
    end

    create index(:seen_shitposts, [:user_id])
    create index(:seen_shitposts, [:shitpost_id])
  end
end
