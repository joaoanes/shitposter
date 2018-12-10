defmodule ShitposterScrapers.Repo.Migrations.CreateScrapers do
  use Ecto.Migration

  def change do
    create table(:scrapers) do
      add :name, :string
      add :current_thread_id, :string
      add :last_content_id, :integer
      add :last_page_id, :integer
      add :elixir_class_name, :string

      timestamps()
    end

  end
end
