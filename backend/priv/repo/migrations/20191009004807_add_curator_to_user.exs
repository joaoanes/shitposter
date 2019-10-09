defmodule ShitposterBackend.Repo.Migrations.AddCuratorToUser do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :is_curator, :boolean
    end
  end
end
