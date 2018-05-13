defmodule ShitposterBackend.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users) do
      add :email, :string
      add :password_hash, :string
      add :name, :string
      add :is_bot, :boolean

      timestamps()
    end

  end
end
