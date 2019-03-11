defmodule ShitposterBackend.Repo.Migrations.CreateShitposts do
  use Ecto.Migration

  def change do
    create table(:shitposts) do
      add :url, :string
      add :permalink, :string
      add :type, :string
      add :name, :string
      add :url_date, :date
      add :source_id, references(:sources, on_delete: :nothing)
      add :submitter_id, references(:users, on_delete: :nothing)

      timestamps()
    end

    create index(:shitposts, [:source_id])
  end
end
