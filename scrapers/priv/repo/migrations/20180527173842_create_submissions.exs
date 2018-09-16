defmodule ShitposterScrapers.Repo.Migrations.CreateSubmissions do
  use Ecto.Migration

  def change do
    create table(:submissions) do
      add :content_url, :text
      add :submitted_id, :integer

      timestamps()
    end

  end
end
