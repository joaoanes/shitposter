defmodule ShitposterBackend.Repo.Migrations.CreateHashtags do
  use Ecto.Migration

  def change do
    create table(:hashtags) do
      add :name, :string

      timestamps()
    end
  end
end
