defmodule ShitposterBackend.Repo.Migrations.CreateRatings do
  use Ecto.Migration

  def change do
    create table(:ratings) do
      add :emoji, :string

      timestamps()
    end
  end
end
